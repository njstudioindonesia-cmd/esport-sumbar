import { Injectable } from '@nestjs/common';
import { Article, ArticleStatus } from '@esport-sumbar/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  category: string;
  gameId?: string;
  isActive: boolean;
  lastFetchedAt?: string;
}

@Injectable()
export class NewsRepository {
  private articles: Map<string, Article> = new Map();
  private sources: Map<string, NewsSource> = new Map();
  private bookmarks: Set<string> = new Set(); // format: `${userId}:${articleId}`

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Initial news sources
    const s1: NewsSource = {
      id: 'src-1',
      name: 'Esports ID Regional',
      url: 'https://esports.id',
      rssUrl: 'https://esports.id/feed',
      category: 'Indonesia',
      gameId: 'Mobile Legends',
      isActive: true,
    };
    const s2: NewsSource = {
      id: 'src-2',
      name: 'Harian Singgalang Sport',
      url: 'https://hariansinggalang.co.id',
      category: 'Sumbar',
      gameId: 'Free Fire',
      isActive: true,
    };
    this.sources.set(s1.id, s1);
    this.sources.set(s2.id, s2);

    // Initial articles
    const a1: Article = {
      id: 'art-001',
      title: 'Padang Pride Raih Trofi Kualifikasi MPL Indonesia Stage Sumatera Barat',
      slug: 'padang-pride-raih-trofi-kualifikasi-mpl-sumbar',
      summary:
        'Tim Mobile Legends asal Kota Padang berhasil mengamankan tiket menuju panggung nasional setelah menundukkan rival sengit dalam 5 match dramatis di Gor H. Agus Salim.',
      body: 'Padang Pride membuktikan dominasinya di scene kompetitif Mobile Legends Sumatera Barat. Dengan kombinasi draft hero agresif dan rotasi disiplin, skuad asuhan Coach Rian berhasil membalikkan keadaan setelah tertinggal 1-2 di awal series.\n\nKemenangan ini memastikan langkah Padang Pride mewakili Sumatera Barat dalam turnamen kualifikasi tingkat nasional yang akan digelar bulan depan.',
      sourceName: 'Esports ID Regional',
      sourceUrl: 'https://esports.id/padang-pride-mpl',
      category: 'Sumbar',
      gameId: 'Mobile Legends',
      tags: ['Mobile Legends', 'MPL', 'Padang', 'Turnamen'],
      viralScore: 98,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const a2: Article = {
      id: 'art-002',
      title: 'Piala Gubernur Esport Sumatera Barat 2026 Digelar Serentak di Bukittinggi',
      slug: 'piala-gubernur-esport-sumatera-barat-2026',
      summary:
        'Sebanyak 128 tim dari 19 kabupaten/kota siap bersaing memperebutkan total hadiah Rp 75.000.000 untuk cabang Free Fire dan PUBG Mobile.',
      body: 'Turnamen akbar tahunan bertajuk Piala Gubernur Sumbar resmi membuka pendaftaran hari ini. Kompetisi mempertandingkan dua game battle royale populer dengan sistem poin placement dan eliminasi ketat.\n\nBabak kualifikasi akan berlangsung secara hybrid online dan grand final offline di pelataran Jam Gadang Bukittinggi.',
      sourceName: 'Harian Singgalang',
      sourceUrl: 'https://hariansinggalang.co.id/piala-gubernur-esport',
      category: 'Sumbar',
      gameId: 'Free Fire',
      tags: ['Free Fire', 'PUBG Mobile', 'Bukittinggi', 'Piala Gubernur'],
      viralScore: 92,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const a3: Article = {
      id: 'art-003',
      title: 'Analisis Meta Patch Terbaru Valorant: Agen Sentinel Kembali Mendominasi Ascent',
      slug: 'analisis-meta-patch-valorant-ascent',
      summary:
        'Perubahan kemampuan Cypher dan Killjoy mengubah total skema pertahanan site A dan B. Simak catatan analitik strategi tim profesional.',
      body: 'Patch anyar membawa dampak signifikan pada kontrol map. Berdasarkan data pertandingan kualifikasi regional, pick-rate Cypher melonjak hingga 84% di map Ascent.',
      sourceName: 'VLR Global Digest',
      sourceUrl: 'https://vlr.example.com/meta-breakdown-patch',
      category: 'Dunia',
      gameId: 'Valorant',
      tags: ['Valorant', 'Meta', 'Analisis', 'Patch'],
      viralScore: 84,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.articles.set(a1.id, a1);
    this.articles.set(a2.id, a2);
    this.articles.set(a3.id, a3);
  }

  // --- Articles ---
  async createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const article: Article = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.articles.set(id, article);
    return article;
  }

  async findArticleById(id: string): Promise<Article | null> {
    return this.articles.get(id) || null;
  }

  async findArticleBySlug(slug: string): Promise<Article | null> {
    for (const a of this.articles.values()) {
      if (a.slug === slug) return a;
    }
    return null;
  }

  async listArticles(filters: {
    status?: ArticleStatus;
    category?: string;
    gameId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Article[]; total: number }> {
    let list = Array.from(this.articles.values());

    if (filters.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters.category && filters.category !== 'Semua') {
      list = list.filter((a) => a.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.gameId) {
      list = list.filter((a) => (a.gameId || '').toLowerCase() === filters.gameId!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
    }

    // Sort by viralScore and date descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);

    return { data: paged, total };
  }

  async updateArticleStatus(id: string, status: ArticleStatus): Promise<Article | null> {
    const article = this.articles.get(id);
    if (!article) return null;
    article.status = status;
    if (status === 'PUBLISHED' && !article.publishedAt) {
      article.publishedAt = new Date().toISOString();
    }
    article.updatedAt = new Date().toISOString();
    this.articles.set(id, article);
    return article;
  }

  // --- Sources ---
  async listSources(): Promise<NewsSource[]> {
    return Array.from(this.sources.values());
  }

  async addSource(source: Omit<NewsSource, 'id'>): Promise<NewsSource> {
    const id = uuidv4();
    const s: NewsSource = { ...source, id };
    this.sources.set(id, s);
    return s;
  }

  // --- Bookmarks ---
  async toggleBookmark(userId: string, articleId: string): Promise<boolean> {
    const key = `${userId}:${articleId}`;
    if (this.bookmarks.has(key)) {
      this.bookmarks.delete(key);
      return false; // unbookmarked
    } else {
      this.bookmarks.add(key);
      return true; // bookmarked
    }
  }

  async listBookmarks(userId: string): Promise<Article[]> {
    const bookmarkedArticles: Article[] = [];
    for (const key of this.bookmarks) {
      if (key.startsWith(`${userId}:`)) {
        const articleId = key.split(':')[1];
        if (articleId && this.articles.has(articleId)) {
          bookmarkedArticles.push(this.articles.get(articleId)!);
        }
      }
    }
    return bookmarkedArticles;
  }
}
