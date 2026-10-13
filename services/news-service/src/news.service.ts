import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NewsRepository, NewsSource } from './database/news.repository';
import { Article, ArticleStatus } from '@esport-sumbar/contracts';
import { StructuredLogger } from '@esport-sumbar/utils';

export interface CreateArticleDto {
  title: string;
  slug: string;
  summary: string;
  body: string;
  sourceName: string;
  sourceUrl: string;
  sourceType?: 'INSTAGRAM' | 'RSS' | 'MANUAL' | 'AI';
  igMediaId?: string;
  igPermalink?: string;
  mediaGallery?: string[];
  category: string;
  gameId?: string | null;
  tags: string[];
  viralScore: number;
  status?: ArticleStatus;
  aiMeta?: Record<string, unknown>;
  publishedAt?: string | null;
}

@Injectable()
export class NewsService {
  private readonly logger = new StructuredLogger('news-service');

  constructor(private readonly newsRepo: NewsRepository) {}

  async listPublishedArticles(query: {
    category?: string;
    gameId?: string;
    sourceType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.newsRepo.listArticles({
      status: 'PUBLISHED',
      category: query.category,
      gameId: query.gameId,
      sourceType: query.sourceType,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  async getTrendingArticles(limit = 5): Promise<Article[]> {
    const { data } = await this.newsRepo.listArticles({
      status: 'PUBLISHED',
      limit,
    });
    // Sort primarily by viralScore descending
    return data.sort((a, b) => b.viralScore - a.viralScore);
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    const article = await this.newsRepo.findArticleBySlug(slug);
    if (!article) {
      throw new NotFoundException(`Artikel dengan slug '${slug}' tidak ditemukan`);
    }
    return article;
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await this.newsRepo.findArticleById(id);
    if (!article) {
      throw new NotFoundException(`Artikel dengan ID '${id}' tidak ditemukan`);
    }
    return article;
  }

  async createArticle(dto: CreateArticleDto): Promise<Article> {
    const existing = await this.newsRepo.findArticleBySlug(dto.slug);
    if (existing) {
      // Append random suffix to make unique slug if conflict
      dto.slug = `${dto.slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const article = await this.newsRepo.createArticle({
      title: dto.title,
      slug: dto.slug,
      summary: dto.summary,
      body: dto.body,
      sourceName: dto.sourceName,
      sourceUrl: dto.sourceUrl,
      sourceType: dto.sourceType || 'RSS',
      igMediaId: dto.igMediaId,
      igPermalink: dto.igPermalink,
      mediaGallery: dto.mediaGallery,
      category: dto.category,
      gameId: dto.gameId,
      tags: dto.tags || [],
      viralScore: dto.viralScore ?? 70,
      status: dto.status || 'REVIEW',
      aiMeta: dto.aiMeta,
      publishedAt: dto.status === 'PUBLISHED' ? new Date().toISOString() : dto.publishedAt,
    });

    this.logger.info(`Article created [${article.id}]: "${article.title}" (Status: ${article.status})`);
    return article;
  }

  async getReviewQueue(query: {
    status?: ArticleStatus;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    return this.newsRepo.listArticles({
      status: query.status || 'REVIEW',
      category: query.category,
      page: query.page,
      limit: query.limit,
    });
  }

  async updateArticleStatus(id: string, status: ArticleStatus): Promise<Article> {
    const validStatuses: ArticleStatus[] = ['DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Status tidak valid: ${status}`);
    }

    const updated = await this.newsRepo.updateArticleStatus(id, status);
    if (!updated) {
      throw new NotFoundException(`Artikel dengan ID '${id}' tidak ditemukan`);
    }

    this.logger.info(`Article [${id}] status updated to: ${status}`);
    return updated;
  }

  async toggleBookmark(userId: string, articleId: string): Promise<{ bookmarked: boolean }> {
    const article = await this.newsRepo.findArticleById(articleId);
    if (!article) {
      throw new NotFoundException(`Artikel '${articleId}' tidak ditemukan`);
    }
    const bookmarked = await this.newsRepo.toggleBookmark(userId, articleId);
    return { bookmarked };
  }

  async getUserBookmarks(userId: string): Promise<Article[]> {
    return this.newsRepo.listBookmarks(userId);
  }

  async listSources(): Promise<NewsSource[]> {
    return this.newsRepo.listSources();
  }

  async addSource(source: Omit<NewsSource, 'id'>): Promise<NewsSource> {
    return this.newsRepo.addSource(source);
  }
}
