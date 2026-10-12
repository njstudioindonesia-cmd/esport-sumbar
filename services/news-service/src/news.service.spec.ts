import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { NewsRepository } from './database/news.repository';

describe('NewsService', () => {
  let service: NewsService;
  let repo: NewsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsService, NewsRepository],
    }).compile();

    service = module.get<NewsService>(NewsService);
    repo = module.get<NewsRepository>(NewsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  it('should return published articles with default pagination', async () => {
    const result = await service.listPublishedArticles({});
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.data.every((a) => a.status === 'PUBLISHED')).toBe(true);
  });

  it('should get article by slug', async () => {
    const article = await service.getArticleBySlug('padang-pride-raih-trofi-kualifikasi-mpl-sumbar');
    expect(article).toBeDefined();
    expect(article.title).toContain('Padang Pride');
  });

  it('should throw error when article slug not found', async () => {
    await expect(service.getArticleBySlug('slug-tidak-ada')).rejects.toThrow();
  });

  it('should get trending articles sorted by viralScore', async () => {
    const trending = await service.getTrendingArticles(2);
    expect(trending.length).toBeLessThanOrEqual(2);
    if (trending.length > 1) {
      expect(trending[0].viralScore).toBeGreaterThanOrEqual(trending[1].viralScore);
    }
  });

  it('should create article with REVIEW status by default', async () => {
    const created = await service.createArticle({
      title: 'Tim Esport Sumbar Siap Berlaga di PON',
      slug: 'tim-esport-sumbar-pon',
      summary: 'Persiapan matang tim PON Sumbar menuju podium.',
      body: 'Pemusatan latihan daerah berlangsung intensif di Padang.',
      sourceName: 'Dispora Sumbar',
      sourceUrl: 'https://dispora.sumbarprov.go.id/esport',
      category: 'Sumbar',
      tags: ['PON', 'Sumbar'],
      viralScore: 88,
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe('REVIEW');
  });

  it('should update article status to PUBLISHED', async () => {
    const created = await service.createArticle({
      title: 'Review Queue Item',
      slug: 'review-queue-item',
      summary: 'Summary text',
      body: 'Full body content',
      sourceName: 'TestSource',
      sourceUrl: 'https://example.com/item',
      category: 'Sumbar',
      tags: ['Test'],
      viralScore: 75,
    });

    const updated = await service.updateArticleStatus(created.id, 'PUBLISHED');
    expect(updated.status).toBe('PUBLISHED');
    expect(updated.publishedAt).toBeDefined();
  });

  it('should toggle bookmark for user', async () => {
    const userId = 'usr-123';
    const article = (await service.listPublishedArticles({}))?.data[0];
    expect(article).toBeDefined();

    const addRes = await service.toggleBookmark(userId, article.id);
    expect(addRes.bookmarked).toBe(true);

    const bookmarks = await service.getUserBookmarks(userId);
    expect(bookmarks.some((b) => b.id === article.id)).toBe(true);

    const removeRes = await service.toggleBookmark(userId, article.id);
    expect(removeRes.bookmarked).toBe(false);
  });
});
