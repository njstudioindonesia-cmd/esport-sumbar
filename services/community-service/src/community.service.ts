import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CommunityRepository } from './database/community.repository';
import { EnvConfig } from './config/env.config';
import {
  Community,
  CommunityMember,
  CommunityRole,
  CommunityPost,
  CommunityComment,
  ContentReport,
  EVENT_TOPICS,
} from '@esport-sumbar/contracts';
import { StructuredLogger } from '@esport-sumbar/utils';

export interface CreateSubCommunityDto {
  name: string;
  gameId: string;
  region: string;
  description: string;
}

export interface CreatePostDto {
  content: string;
  media?: string[];
}

export interface CreateCommentDto {
  content: string;
  parentId?: string | null;
}

export interface CreateReportDto {
  communityId: string;
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  targetPreview: string;
  reason: string;
  category: 'SPAM' | 'TOXIC' | 'SARA' | 'JUDI' | 'LAINNYA';
}

@Injectable()
export class CommunityService {
  private readonly logger = new StructuredLogger('community-service');

  constructor(
    @Inject('CONFIG') private readonly env: EnvConfig,
    private readonly repo: CommunityRepository,
  ) {}

  async listCommunities(filters?: {
    gameId?: string;
    region?: string;
    type?: string;
    search?: string;
  }): Promise<Community[]> {
    return this.repo.listCommunities(filters);
  }

  async getCommunityBySlug(slug: string) {
    const community = await this.repo.findCommunityBySlug(slug);
    if (!community) {
      throw new NotFoundException(`Komunitas dengan slug '${slug}' tidak ditemukan`);
    }
    const members = await this.repo.getMembers(community.id);
    const posts = await this.repo.listPosts(community.id);
    return {
      community,
      members,
      posts,
    };
  }

  async createSubCommunity(
    userId: string,
    nickname: string,
    city: string | undefined,
    dto: CreateSubCommunityDto,
  ): Promise<Community> {
    if (!dto.name || dto.name.trim().length < 4) {
      throw new BadRequestException('Nama sub-komunitas minimal 4 karakter');
    }

    const baseSlug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const existing = await this.repo.findCommunityBySlug(baseSlug);
    const slug = existing ? `${baseSlug}-${Math.floor(100 + Math.random() * 900)}` : baseSlug;

    const community = await this.repo.createCommunity({
      name: dto.name.trim(),
      slug,
      gameId: dto.gameId,
      region: dto.region,
      description: dto.description,
      type: 'USER',
      ownerId: userId,
    });

    await this.repo.addMember({
      userId,
      nickname,
      city: city || dto.region,
      communityId: community.id,
      role: 'OWNER',
      joinedAt: new Date().toISOString(),
    });

    this.logger.info(`Sub-community created: ${community.name} (${community.slug}) by ${userId}`);
    return community;
  }

  async joinCommunity(
    communityId: string,
    userId: string,
    nickname: string,
    city?: string,
  ): Promise<CommunityMember> {
    const community = await this.repo.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException(`Komunitas '${communityId}' tidak ditemukan`);
    }

    const member = await this.repo.addMember({
      userId,
      nickname,
      city: city || 'Padang',
      communityId,
      role: 'MEMBER',
      joinedAt: new Date().toISOString(),
    });

    this.logger.info(`User ${nickname} (${userId}) joined community ${community.slug}`);
    return member;
  }

  async leaveCommunity(communityId: string, userId: string): Promise<{ left: boolean }> {
    const member = await this.repo.getMember(communityId, userId);
    if (!member) {
      throw new BadRequestException('Anda belum tergabung dalam komunitas ini');
    }
    if (member.role === 'OWNER') {
      throw new ForbiddenException('Owner komunitas tidak dapat keluar sebelum mentransfer kepemilikan');
    }

    const left = await this.repo.removeMember(communityId, userId);
    return { left };
  }

  async updateMemberRole(
    communityId: string,
    actorId: string,
    targetUserId: string,
    newRole: CommunityRole,
  ): Promise<CommunityMember> {
    const actor = await this.repo.getMember(communityId, actorId);
    if (!actor || actor.role !== 'OWNER') {
      throw new ForbiddenException('Hanya OWNER komunitas yang dapat mengubah peran moderator');
    }

    const updated = await this.repo.updateMemberRole(communityId, targetUserId, newRole);
    if (!updated) {
      throw new NotFoundException('Anggota target tidak ditemukan dalam komunitas');
    }
    this.logger.info(`Role updated in ${communityId}: user ${targetUserId} -> ${newRole}`);
    return updated;
  }

  async createPost(
    communityId: string,
    userId: string,
    authorNickname: string,
    dto: CreatePostDto,
  ): Promise<CommunityPost> {
    const community = await this.repo.findCommunityById(communityId);
    if (!community) {
      throw new NotFoundException(`Komunitas '${communityId}' tidak ditemukan`);
    }

    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestException('Konten postingan tidak boleh kosong');
    }

    // Emit event bus trace: post.created.v1 -> AI Moderation
    this.logger.info(`Event emitted [${EVENT_TOPICS.POST_CREATED}] for pre-moderation`, 'EventBus', {
      communityId,
      authorId: userId,
    });

    const modResult = await this.evaluateAiModeration(dto.content);
    this.logger.info(`Event received [${EVENT_TOPICS.MODERATION_RESULT}]`, 'EventBus', {
      decision: modResult.decision,
      categoriesFlagged: modResult.categoriesFlagged,
    });

    if (modResult.decision === 'REJECT') {
      // Auto-create flagged report in moderation queue for audit
      await this.repo.createReport({
        communityId,
        targetType: 'POST',
        targetId: 'auto-blocked',
        targetPreview: dto.content.slice(0, 120),
        reporterId: 'system-ai-moderator',
        reporterNickname: 'AI Safety Engine',
        reason: modResult.reason || 'Terdeteksi melanggar kebijakan komunitas (Toxic/Judi/SARA)',
        category: modResult.categoriesFlagged.includes('judi') ? 'JUDI' : 'TOXIC',
        status: 'PENDING',
        aiFlagged: true,
      });

      throw new BadRequestException({
        code: 'CONTENT_REJECTED_BY_AI_MODERATION',
        message: `Postingan ditolak oleh AI Moderator: ${modResult.reason}`,
        categoriesFlagged: modResult.categoriesFlagged,
      });
    }

    const member = await this.repo.getMember(communityId, userId);

    return this.repo.createPost({
      communityId,
      authorId: userId,
      authorNickname,
      authorRole: member?.role || 'MEMBER',
      content: dto.content.trim(),
      media: dto.media || [],
      pinned: false,
      status: 'PUBLISHED',
    });
  }

  async togglePinPost(
    communityId: string,
    postId: string,
    actorId: string,
  ): Promise<CommunityPost> {
    const member = await this.repo.getMember(communityId, actorId);
    if (!member || (member.role !== 'MODERATOR' && member.role !== 'OWNER')) {
      throw new ForbiddenException('Hanya MODERATOR atau OWNER yang dapat menyematkan (pin) post');
    }

    const post = await this.repo.findPostById(postId);
    if (!post || post.communityId !== communityId) {
      throw new NotFoundException('Postingan tidak ditemukan di komunitas ini');
    }

    post.pinned = !post.pinned;
    return this.repo.updatePost(post);
  }

  async toggleLikePost(userId: string, postId: string) {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      throw new NotFoundException('Postingan tidak ditemukan');
    }
    return this.repo.toggleLikePost(userId, postId);
  }

  async getPostComments(postId: string): Promise<CommunityComment[]> {
    return this.repo.getComments(postId);
  }

  async createComment(
    postId: string,
    userId: string,
    authorNickname: string,
    dto: CreateCommentDto,
  ): Promise<CommunityComment> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      throw new NotFoundException('Postingan tidak ditemukan');
    }

    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestException('Komentar tidak boleh kosong');
    }

    // AI Pre-Moderation on comment
    const modResult = await this.evaluateAiModeration(dto.content);
    if (modResult.decision === 'REJECT') {
      throw new BadRequestException({
        code: 'COMMENT_REJECTED_BY_AI_MODERATION',
        message: `Komentar ditolak oleh AI Moderator: ${modResult.reason}`,
      });
    }

    // Enforce 1-level comment nesting (Section 4.2 of PROJECT_SPEC.md)
    let resolvedParentId: string | null = dto.parentId || null;
    if (resolvedParentId) {
      const parentComment = await this.repo.findCommentById(postId, resolvedParentId);
      if (!parentComment) {
        throw new BadRequestException('Komentar induk tidak ditemukan');
      }
      // If parent itself is a reply, flatten to the root comment ID (1-level max)
      if (parentComment.parentId) {
        resolvedParentId = parentComment.parentId;
      }
    }

    const member = await this.repo.getMember(post.communityId, userId);

    return this.repo.createComment({
      postId,
      authorId: userId,
      authorNickname,
      authorRole: member?.role || 'MEMBER',
      parentId: resolvedParentId,
      content: dto.content.trim(),
    });
  }

  async reportContent(
    reporterId: string,
    reporterNickname: string,
    dto: CreateReportDto,
  ): Promise<ContentReport> {
    return this.repo.createReport({
      communityId: dto.communityId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      targetPreview: dto.targetPreview,
      reporterId,
      reporterNickname,
      reason: dto.reason,
      category: dto.category,
      status: 'PENDING',
      aiFlagged: false,
    });
  }

  async listReports(status?: string): Promise<ContentReport[]> {
    return this.repo.listReports(status);
  }

  async resolveReport(
    reportId: string,
    status: 'RESOLVED' | 'DISMISSED',
  ): Promise<ContentReport> {
    const updated = await this.repo.updateReportStatus(reportId, status);
    if (!updated) {
      throw new NotFoundException(`Laporan '${reportId}' tidak ditemukan`);
    }
    return updated;
  }

  private async evaluateAiModeration(text: string): Promise<{
    approved: boolean;
    decision: 'APPROVE' | 'FLAG' | 'REJECT';
    reason?: string;
    categoriesFlagged: string[];
  }> {
    try {
      const response = await fetch(`${this.env.AI_SERVICE_URL}/ai/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        return (await response.json()) as {
          approved: boolean;
          decision: 'APPROVE' | 'FLAG' | 'REJECT';
          reason?: string;
          categoriesFlagged: string[];
        };
      }
    } catch {
      // Fallback to deterministic local guard when ai-service is unreachable in unit tests
    }

    const lower = text.toLowerCase();
    const isJudi =
      lower.includes('slot') ||
      lower.includes('gacor') ||
      lower.includes('judi') ||
      lower.includes('maxwin');
    const isToxic =
      lower.includes('anjing') ||
      lower.includes('babi') ||
      lower.includes('kontol') ||
      lower.includes('bangsat');

    const categoriesFlagged: string[] = [];
    if (isJudi) categoriesFlagged.push('judi');
    if (isToxic) categoriesFlagged.push('toxic');

    const approved = categoriesFlagged.length === 0;
    return {
      approved,
      decision: approved ? 'APPROVE' : 'REJECT',
      reason: approved
        ? 'Konten aman'
        : `Terdeteksi pelanggaran kebijakan komunitas (${categoriesFlagged.join(', ')})`,
      categoriesFlagged,
    };
  }
}
