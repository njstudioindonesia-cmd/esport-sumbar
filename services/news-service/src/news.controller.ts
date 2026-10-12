import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NewsService, CreateArticleDto } from './news.service';

@ApiTags('Public News & Articles')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar artikel berita terpublikasi dengan filter' })
  @ApiQuery({ name: 'category', required: false, description: 'Kategori (Semua, Sumbar, Nasional, Dunia)' })
  @ApiQuery({ name: 'gameId', required: false, description: 'Filter cabang game' })
  @ApiQuery({ name: 'search', required: false, description: 'Kata kunci pencarian judul atau ringkasan' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getArticles(
    @Query('category') category?: string,
    @Query('gameId') gameId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.newsService.listPublishedArticles({
      category,
      gameId,
      search,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('trending')
  @ApiOperation({ summary: 'Mendapatkan top 5 berita trending dengan skor viral tertinggi' })
  async getTrending(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.newsService.getTrendingArticles(limitNum);
  }

  @Get('sources')
  @ApiOperation({ summary: 'Mendapatkan daftar sumber RSS/Media mitra yang aktif' })
  async getSources() {
    return this.newsService.listSources();
  }

  @Get('user/bookmarks')
  @ApiOperation({ summary: 'Mendapatkan daftar artikel yang disimpan oleh pengguna' })
  async getUserBookmarks(@Headers('x-user-id') userId?: string) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id diperlukan untuk melihat bookmark');
    }
    return this.newsService.getUserBookmarks(userId);
  }

  @Post(':id/bookmark')
  @ApiOperation({ summary: 'Bookmark atau unbookmark artikel untuk pengguna' })
  async toggleBookmark(
    @Param('id') articleId: string,
    @Headers('x-user-id') headerUserId?: string,
    @Body('userId') bodyUserId?: string,
  ) {
    const userId = headerUserId || bodyUserId;
    if (!userId) {
      throw new BadRequestException('userId diperlukan via header x-user-id atau body');
    }
    return this.newsService.toggleBookmark(userId, articleId);
  }

  @Post()
  @ApiOperation({ summary: 'Membuat artikel baru (digunakan oleh ingestor worker)' })
  @ApiResponse({ status: 201, description: 'Artikel berhasil disimpan' })
  async createArticle(@Body() body: CreateArticleDto) {
    return this.newsService.createArticle(body);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Mendapatkan detail artikel berdasarkan slug' })
  async getArticleBySlug(@Param('slug') slug: string) {
    return this.newsService.getArticleBySlug(slug);
  }
}
