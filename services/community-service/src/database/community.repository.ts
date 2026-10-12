import { Injectable } from '@nestjs/common';
import {
  Community,
  CommunityMember,
  CommunityRole,
  CommunityPost,
  CommunityComment,
  ContentReport,
} from '@esport-sumbar/contracts';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommunityRepository {
  private communities: Map<string, Community> = new Map();
  private members: Map<string, CommunityMember[]> = new Map(); // communityId -> members
  private posts: Map<string, CommunityPost> = new Map();
  private comments: Map<string, CommunityComment[]> = new Map(); // postId -> comments
  private likes: Set<string> = new Set(); // `${userId}:${postId}`
  private reports: Map<string, ContentReport> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const now = new Date().toISOString();

    const c1: Community = {
      id: 'com-001',
      gameId: 'Mobile Legends',
      name: 'Mobile Legends Bang Bang Sumatera Barat',
      slug: 'mlbb-sumbar',
      description:
        'Komunitas resmi atlet & pemain MLBB se-Sumatera Barat. Info scrim, mabar, dan pendaftaran turnamen.',
      type: 'OFFICIAL',
      ownerId: 'usr-admin-1',
      region: 'Sumatera Barat',
      memberCount: 3840,
      createdAt: now,
    };

    const c2: Community = {
      id: 'com-002',
      gameId: 'Free Fire',
      name: 'Free Fire Bukittinggi & Agam Community',
      slug: 'free-fire-bukittinggi-agam',
      description: 'Basis guild dan squad Free Fire kawasan Bukittinggi dan Agam.',
      type: 'OFFICIAL',
      ownerId: 'usr-admin-1',
      region: 'Bukittinggi',
      memberCount: 2150,
      createdAt: now,
    };

    const c3: Community = {
      id: 'com-003',
      gameId: 'Valorant',
      name: 'Valorant Ranah Minang Syndicate',
      slug: 'valorant-ranah-minang',
      description:
        'Komunitas pemain Valorant Sumbar untuk pencarian tim, turnamen mingguan, dan scrim premier.',
      type: 'OFFICIAL',
      ownerId: 'usr-admin-1',
      region: 'Padang',
      memberCount: 1420,
      createdAt: now,
    };

    const c4: Community = {
      id: 'com-004',
      gameId: 'PUBG Mobile',
      name: 'PUBG Mobile Payakumbuh & 50 Kota',
      slug: 'pubgm-payakumbuh',
      description:
        'Wadah mabar dan turnamen offline cafe gamers Payakumbuh dan Lima Puluh Kota.',
      type: 'USER',
      ownerId: 'usr-captain-1',
      region: 'Payakumbuh',
      memberCount: 980,
      createdAt: now,
    };

    [c1, c2, c3, c4].forEach((c) => this.communities.set(c.id, c));

    // Seed members for com-001
    this.members.set('com-001', [
      {
        userId: 'usr-admin-1',
        nickname: 'CoachRian_PDG',
        city: 'Padang',
        communityId: 'com-001',
        role: 'OWNER',
        joinedAt: now,
      },
      {
        userId: 'usr-mod-1',
        nickname: 'GarudaMinang_Mod',
        city: 'Bukittinggi',
        communityId: 'com-001',
        role: 'MODERATOR',
        joinedAt: now,
      },
      {
        userId: 'usr-player-1',
        nickname: 'RizkySlayer99',
        city: 'Payakumbuh',
        communityId: 'com-001',
        role: 'MEMBER',
        joinedAt: now,
      },
    ]);

    // Seed posts
    const p1: CommunityPost = {
      id: 'post-001',
      communityId: 'com-001',
      authorId: 'usr-mod-1',
      authorNickname: 'GarudaMinang_Mod',
      authorRole: 'MODERATOR',
      content:
        '[PENGUMUMAN RESMI] Jadwal Scrim Gabungan Persiapan Minang Super League Season 4 dibuka setiap Jumat & Sabtu pukul 20.00 WIB. Silakan daftarkan nama squad dan ID Kapten di kolom komentar!',
      media: [],
      pinned: true,
      likesCount: 42,
      commentsCount: 2,
      status: 'PUBLISHED',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    };

    const p2: CommunityPost = {
      id: 'post-002',
      communityId: 'com-001',
      authorId: 'usr-player-1',
      authorNickname: 'RizkySlayer99',
      authorRole: 'MEMBER',
      content:
        'Info tim yang butuh Roamer / EXP Laner area Kota Padang untuk turnamen offline UNP minggu depan. Tier Mythical Glory 85 bintang siap latihan rutin.',
      media: [],
      pinned: false,
      likesCount: 15,
      commentsCount: 0,
      status: 'PUBLISHED',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };

    this.posts.set(p1.id, p1);
    this.posts.set(p2.id, p2);

    // Seed 1-level nested comments on post-001
    const cm1: CommunityComment = {
      id: 'cmt-001',
      postId: 'post-001',
      authorId: 'usr-player-1',
      authorNickname: 'RizkySlayer99',
      authorRole: 'MEMBER',
      parentId: null,
      content: 'Hadir bang! Squad Padang Pride siap ikut slot Jumat malam.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    };
    const cm2: CommunityComment = {
      id: 'cmt-002',
      postId: 'post-001',
      authorId: 'usr-mod-1',
      authorNickname: 'GarudaMinang_Mod',
      authorRole: 'MODERATOR',
      parentId: 'cmt-001',
      content: 'Mantap! Sudah dicatat di bracket latihan Grup A ya.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    };
    this.comments.set('post-001', [cm1, cm2]);

    // Seed sample report
    const rep1: ContentReport = {
      id: 'rep-001',
      communityId: 'com-001',
      targetType: 'POST',
      targetId: 'post-spam-99',
      targetPreview: 'Jual akun murah tanpa rekber hubungi WA...',
      reporterId: 'usr-player-1',
      reporterNickname: 'RizkySlayer99',
      reason: 'Indikasi penipuan jual beli akun tanpa rekber resmi',
      category: 'SPAM',
      status: 'PENDING',
      aiFlagged: true,
      createdAt: now,
    };
    this.reports.set(rep1.id, rep1);
  }

  // --- Communities ---
  async listCommunities(filters?: {
    gameId?: string;
    region?: string;
    type?: string;
    search?: string;
  }): Promise<Community[]> {
    let list = Array.from(this.communities.values());
    if (filters?.gameId && filters.gameId !== 'Semua Game') {
      list = list.filter((c) => c.gameId.toLowerCase() === filters.gameId!.toLowerCase());
    }
    if (filters?.region && filters.region !== 'Semua Wilayah') {
      list = list.filter((c) => (c.region || '').toLowerCase().includes(filters.region!.toLowerCase()));
    }
    if (filters?.type && filters.type !== 'ALL') {
      list = list.filter((c) => c.type === filters.type);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q),
      );
    }
    return list;
  }

  async findCommunityById(id: string): Promise<Community | null> {
    return this.communities.get(id) || null;
  }

  async findCommunityBySlug(slug: string): Promise<Community | null> {
    for (const c of this.communities.values()) {
      if (c.slug === slug) return c;
    }
    return null;
  }

  async createCommunity(data: Omit<Community, 'id' | 'createdAt' | 'memberCount'>): Promise<Community> {
    const id = `com-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const community: Community = {
      ...data,
      id,
      memberCount: 1,
      createdAt: now,
    };
    this.communities.set(id, community);
    return community;
  }

  // --- Memberships ---
  async getMembers(communityId: string): Promise<CommunityMember[]> {
    return this.members.get(communityId) || [];
  }

  async getMember(communityId: string, userId: string): Promise<CommunityMember | null> {
    const list = this.members.get(communityId) || [];
    return list.find((m) => m.userId === userId) || null;
  }

  async addMember(member: CommunityMember): Promise<CommunityMember> {
    const list = this.members.get(member.communityId) || [];
    const existingIdx = list.findIndex((m) => m.userId === member.userId);
    if (existingIdx >= 0) {
      return list[existingIdx]!;
    }
    list.push(member);
    this.members.set(member.communityId, list);

    const com = this.communities.get(member.communityId);
    if (com) {
      com.memberCount += 1;
      this.communities.set(com.id, com);
    }
    return member;
  }

  async removeMember(communityId: string, userId: string): Promise<boolean> {
    const list = this.members.get(communityId) || [];
    const filtered = list.filter((m) => m.userId !== userId);
    if (filtered.length === list.length) return false;

    this.members.set(communityId, filtered);
    const com = this.communities.get(communityId);
    if (com && com.memberCount > 0) {
      com.memberCount -= 1;
      this.communities.set(com.id, com);
    }
    return true;
  }

  async updateMemberRole(
    communityId: string,
    userId: string,
    role: CommunityRole,
  ): Promise<CommunityMember | null> {
    const list = this.members.get(communityId) || [];
    const target = list.find((m) => m.userId === userId);
    if (!target) return null;
    target.role = role;
    this.members.set(communityId, list);
    return target;
  }

  // --- Posts ---
  async listPosts(communityId: string): Promise<CommunityPost[]> {
    const list = Array.from(this.posts.values()).filter(
      (p) => p.communityId === communityId && p.status === 'PUBLISHED',
    );
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async findPostById(postId: string): Promise<CommunityPost | null> {
    return this.posts.get(postId) || null;
  }

  async createPost(data: Omit<CommunityPost, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>): Promise<CommunityPost> {
    const id = `post-${uuidv4().slice(0, 8)}`;
    const post: CommunityPost = {
      ...data,
      id,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(post: CommunityPost): Promise<CommunityPost> {
    this.posts.set(post.id, post);
    return post;
  }

  async toggleLikePost(userId: string, postId: string): Promise<{ liked: boolean; likesCount: number }> {
    const post = this.posts.get(postId);
    if (!post) throw new Error('Post not found');

    const key = `${userId}:${postId}`;
    let liked = false;
    if (this.likes.has(key)) {
      this.likes.delete(key);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      this.likes.add(key);
      post.likesCount += 1;
      liked = true;
    }
    this.posts.set(postId, post);
    return { liked, likesCount: post.likesCount };
  }

  // --- Comments ---
  async getComments(postId: string): Promise<CommunityComment[]> {
    return this.comments.get(postId) || [];
  }

  async findCommentById(postId: string, commentId: string): Promise<CommunityComment | null> {
    const list = this.comments.get(postId) || [];
    return list.find((c) => c.id === commentId) || null;
  }

  async createComment(data: Omit<CommunityComment, 'id' | 'createdAt'>): Promise<CommunityComment> {
    const id = `cmt-${uuidv4().slice(0, 8)}`;
    const comment: CommunityComment = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    const list = this.comments.get(data.postId) || [];
    list.push(comment);
    this.comments.set(data.postId, list);

    const post = this.posts.get(data.postId);
    if (post) {
      post.commentsCount += 1;
      this.posts.set(post.id, post);
    }
    return comment;
  }

  // --- Reports ---
  async createReport(data: Omit<ContentReport, 'id' | 'createdAt'>): Promise<ContentReport> {
    const id = `rep-${uuidv4().slice(0, 8)}`;
    const report: ContentReport = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.reports.set(id, report);
    return report;
  }

  async listReports(status?: string): Promise<ContentReport[]> {
    const all = Array.from(this.reports.values());
    if (status && status !== 'ALL') {
      return all.filter((r) => r.status === status);
    }
    return all;
  }

  async updateReportStatus(
    id: string,
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED',
  ): Promise<ContentReport | null> {
    const rep = this.reports.get(id);
    if (!rep) return null;
    rep.status = status;
    this.reports.set(id, rep);

    if (status === 'RESOLVED' && rep.targetType === 'POST') {
      const post = this.posts.get(rep.targetId);
      if (post) {
        post.status = 'REJECTED';
        this.posts.set(post.id, post);
      }
    }
    return rep;
  }
}
