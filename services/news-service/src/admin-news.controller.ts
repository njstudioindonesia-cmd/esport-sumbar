import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NewsService, CreateArticleDto } from './news.service';
import { ArticleStatus } from '@esport-sumbar/contracts';

@ApiTags('Admin Editorial & Review Queue')
@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('curated')
  @ApiOperation({ summary: 'Menerima artikel hasil kurasi pipeline Instagram/RSS' })
  async createCuratedArticle(@Body() body: CreateArticleDto) {
    return this.newsService.createArticle(body);
  }

  @Get('review')
  @ApiOperation({ summary: 'Mendapatkan antrean artikel AI yang butuh kurasi/review redaksi' })
  @ApiQuery({ name: 'status', required: false, enum: ['REVIEW', 'DRAFT', 'REJECTED', 'PUBLISHED'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getReviewQueue(
    @Query('status') status?: ArticleStatus,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.newsService.getReviewQueue({
      status: status || 'REVIEW',
      category,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Menyetujui (PUBLISHED) atau menolak (REJECTED) artikel hasil kurasi AI' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ArticleStatus,
  ) {
    if (!status) {
      throw new BadRequestException('status wajib diisi');
    }
    return this.newsService.updateArticleStatus(id, status);
  }
}
