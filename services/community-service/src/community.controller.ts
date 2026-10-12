import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  CommunityService,
  CreateSubCommunityDto,
  CreatePostDto,
  CreateCommentDto,
  CreateReportDto,
} from './community.service';
import { CommunityRole } from '@esport-sumbar/contracts';

@ApiTags('Communities & Discussions')
@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar komunitas esport Sumatera Barat per game & wilayah' })
  @ApiQuery({ name: 'gameId', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  async listCommunities(
    @Query('gameId') gameId?: string,
    @Query('region') region?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.communityService.listCommunities({ gameId, region, type, search });
  }

  @Post()
  @ApiOperation({ summary: 'Membuat sub-komunitas baru oleh pengguna (tipe USER)' })
  async createSubCommunity(
    @Headers('x-user-id') headerUserId?: string,
    @Body()
    body?: CreateSubCommunityDto & { userId?: string; nickname?: string; city?: string },
  ) {
    const userId = headerUserId || body?.userId || 'usr-player-1';
    const nickname = body?.nickname || 'GamerMinang';
    if (!body) throw new BadRequestException('Body request diperlukan');
    return this.communityService.createSubCommunity(userId, nickname, body.city, body);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Mendapatkan detail komunitas beserta anggota dan diskusi berdasarkan slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.communityService.getCommunityBySlug(slug);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Bergabung ke dalam komunitas' })
  async joinCommunity(
    @Param('id') communityId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: { userId?: string; nickname?: string; city?: string },
  ) {
    const userId = headerUserId || body?.userId || 'usr-player-1';
    const nickname = body?.nickname || 'GamerMinang';
    return this.communityService.joinCommunity(communityId, userId, nickname, body?.city);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Keluar dari komunitas' })
  async leaveCommunity(
    @Param('id') communityId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: { userId?: string },
  ) {
    const userId = headerUserId || body?.userId || 'usr-player-1';
    return this.communityService.leaveCommunity(communityId, userId);
  }

  @Patch(':id/members/:targetUserId/role')
  @ApiOperation({ summary: 'Mengubah peran anggota komunitas (OWNER only)' })
  async updateMemberRole(
    @Param('id') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: { actorId?: string; role: CommunityRole },
  ) {
    const actorId = headerUserId || body?.actorId || 'usr-admin-1';
    if (!body?.role) throw new BadRequestException('Field role wajib diisi');
    return this.communityService.updateMemberRole(communityId, actorId, targetUserId, body.role);
  }

  @Post(':id/posts')
  @ApiOperation({ summary: 'Membuat postingan diskusi baru (dilindungi AI Pre-Moderation)' })
  async createPost(
    @Param('id') communityId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: CreatePostDto & { userId?: string; authorNickname?: string },
  ) {
    const userId = headerUserId || body?.userId || 'usr-player-1';
    const nickname = body?.authorNickname || 'RizkySlayer99';
    if (!body) throw new BadRequestException('Konten postingan diperlukan');
    return this.communityService.createPost(communityId, userId, nickname, body);
  }

  @Patch(':id/posts/:postId/pin')
  @ApiOperation({ summary: 'Pin atau Unpin postingan di atas diskusi (MODERATOR / OWNER only)' })
  async togglePin(
    @Param('id') communityId: string,
    @Param('postId') postId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: { actorId?: string },
  ) {
    const actorId = headerUserId || body?.actorId || 'usr-mod-1';
    return this.communityService.togglePinPost(communityId, postId, actorId);
  }

  @Post('posts/:postId/like')
  @ApiOperation({ summary: 'Like atau Unlike postingan komunitas' })
  async toggleLike(
    @Param('postId') postId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: { userId?: string },
  ) {
    const userId = headerUserId || body?.userId || 'usr-player-1';
    return this.communityService.toggleLikePost(userId, postId);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Mendapatkan daftar komentar pada suatu postingan' })
  async getComments(@Param('postId') postId: string) {
    return this.communityService.getPostComments(postId);
  }

  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Menambahkan komentar atau balasan bertingkat 1 level' })
  async createComment(
    @Param('postId') postId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: CreateCommentDto & { userId?: string; authorNickname?: string },
  ) {
    const userId = headerUserId || body?.userId || 'usr-player-1';
    const nickname = body?.authorNickname || 'RizkySlayer99';
    if (!body) throw new BadRequestException('Konten komentar diperlukan');
    return this.communityService.createComment(postId, userId, nickname, body);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Melaporkan postingan atau komentar yang melanggar aturan' })
  async reportContent(
    @Headers('x-user-id') headerUserId?: string,
    @Body() body?: CreateReportDto & { reporterId?: string; reporterNickname?: string },
  ) {
    const reporterId = headerUserId || body?.reporterId || 'usr-player-1';
    const reporterNickname = body?.reporterNickname || 'RizkySlayer99';
    if (!body) throw new BadRequestException('Data laporan diperlukan');
    return this.communityService.reportContent(reporterId, reporterNickname, body);
  }
}
