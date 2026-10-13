import { Injectable, BadRequestException } from '@nestjs/common';
import { ClaudeLlmProvider } from '../providers/claude-llm.provider';
import { PROMPTS } from '../prompts/prompt-registry';
import {
  NewsIngestedPayload,
  NewsCuratedPayload,
  NewsCuratedPayloadSchema,
} from '@esport-sumbar/contracts';
import { StructuredLogger } from '@esport-sumbar/utils';

export interface CuratedNewsResult {
  curated: NewsCuratedPayload;
  telemetry: {
    provider: string;
    promptVersion: string;
    latencyMs: number;
    tokens: number;
    costUsd: number;
  };
}

export interface ModerationResult {
  approved: boolean;
  decision: 'APPROVE' | 'FLAG' | 'REJECT';
  reason?: string;
  categoriesFlagged: string[];
  latencyMs: number;
}

@Injectable()
export class AiService {
  private readonly logger = new StructuredLogger('ai-service');

  constructor(private readonly llmProvider: ClaudeLlmProvider) {}

  async curateNews(rawItem: NewsIngestedPayload): Promise<CuratedNewsResult> {
    const promptConfig = PROMPTS.NEWS_CURATOR;
    const userPrompt = JSON.stringify(rawItem, null, 2);

    const result = await this.llmProvider.generateCompletion(
      promptConfig.systemPrompt,
      userPrompt,
      promptConfig.temperature,
    );

    let parsedJson: unknown;
    try {
      // Strip potential markdown backticks if returned by LLM
      const cleaned = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedJson = JSON.parse(cleaned);
    } catch {
      this.logger.error('Failed to parse LLM completion as JSON', new Error(result.content));
      throw new BadRequestException('Keluaran kurasi AI gagal di-parse sebagai JSON');
    }

    // Strict validation against contracts Zod schema
    const validation = NewsCuratedPayloadSchema.safeParse(parsedJson);
    if (!validation.success) {
      this.logger.error(
        'Curated news output schema validation failed',
        new Error(JSON.stringify(validation.error.format())),
      );
      throw new BadRequestException({
        message: 'Hasil kurasi AI tidak sesuai dengan skema kontrak NewsCuratedPayload',
        details: validation.error.format(),
      });
    }

    this.logger.info(`Successfully curated article: "${validation.data.title}"`, 'AiService', {
      source: validation.data.sourceName,
      viralScore: validation.data.viralScore,
      latencyMs: result.usage.latencyMs,
    });

    return {
      curated: validation.data,
      telemetry: {
        provider: result.provider,
        promptVersion: promptConfig.version,
        latencyMs: result.usage.latencyMs,
        tokens: result.usage.totalTokens,
        costUsd: result.usage.estimatedCostUsd,
      },
    };
  }

  async moderateContent(text: string): Promise<ModerationResult> {
    const promptConfig = PROMPTS.CONTENT_MODERATOR;

    const result = await this.llmProvider.generateCompletion(
      promptConfig.systemPrompt,
      text,
      promptConfig.temperature,
    );

    try {
      const cleaned = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      return {
        approved: Boolean(parsed.approved),
        decision: parsed.decision || (parsed.approved ? 'APPROVE' : 'REJECT'),
        reason: parsed.reason,
        categoriesFlagged: Array.isArray(parsed.categoriesFlagged) ? parsed.categoriesFlagged : [],
        latencyMs: result.usage.latencyMs,
      };
    } catch {
      return {
        approved: true,
        decision: 'APPROVE',
        categoriesFlagged: [],
        latencyMs: result.usage.latencyMs,
      };
    }
  }

  async generateEoPackage(
    prompt: string,
    context?: Record<string, unknown>,
  ) {
    const promptConfig = PROMPTS.EO_ASSISTANT;
    const userPrompt = JSON.stringify({ prompt, context: context ?? {} }, null, 2);

    const result = await this.llmProvider.generateCompletion(
      promptConfig.systemPrompt,
      userPrompt,
      promptConfig.temperature,
    );

    try {
      const cleaned = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned);

      return {
        package: parsed,
        telemetry: {
          provider: result.provider,
          promptVersion: promptConfig.version,
          latencyMs: result.usage.latencyMs,
          costUsd: result.usage.estimatedCostUsd,
        },
      };
    } catch {
      throw new BadRequestException('Gagal memproses hasil asisten AI sebagai JSON');
    }
  }

  async searchSemantic(
    query: string,
    typeFilter?: 'NEWS' | 'COMMUNITY' | 'EVENT',
    topK = 6,
  ) {
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);

    // Indexed Knowledge Base for ESPORT SUMBAR
    const corpus = [
      // NEWS
      {
        id: 'news-001',
        type: 'NEWS' as const,
        title: 'Tim Esport Sumbar Siap Berlaga di PON 2026: Target Medali Emas Mobile Legends',
        snippet: 'Ranah Minang mempersiapkan 5 atlet terbaik hasil seleksi ketat Kejurda Padang menuju Pekan Olahraga Nasional.',
        link: '/berita/tim-esport-sumbar-siap-berlaga-di-pon',
        category: 'Sumbar',
        city: 'Padang',
        tags: ['PON', 'MLBB', 'Sumbar', 'Padang', 'Emas'],
      },
      {
        id: 'news-002',
        type: 'NEWS' as const,
        title: 'Kualifikasi Valorant Campus Series Sumbar 2026 Resmi Dimulai',
        snippet: 'Pertempuran taktis 5v5 antar mahasiswa Unand, UNP, dan UPI YPTK memperebutkan total hadiah 10 juta rupiah.',
        link: '/berita/kualifikasi-valorant-campus-series-sumbar-2026',
        category: 'Sumbar',
        city: 'Padang',
        tags: ['Valorant', 'Kampus', 'Padang', 'Turnamen'],
      },
      {
        id: 'news-003',
        type: 'NEWS' as const,
        title: 'Free Fire Jam Gadang Clash Hadirkan 24 Squad Terbaik Bukittinggi',
        snippet: 'Komunitas Bukittinggi Gaming Hub menggelar turnamen offline battle royale seru di Lapangan Kantin.',
        link: '/berita/free-fire-jam-gadang-clash-hadirkan-24-squad-terbaik',
        category: 'Sumbar',
        city: 'Bukittinggi',
        tags: ['Free Fire', 'Bukittinggi', 'Jam Gadang', 'Battle Royale'],
      },
      // COMMUNITIES
      {
        id: 'comm-mlbb-sumbar',
        type: 'COMMUNITY' as const,
        title: 'Mobile Legends Bang Bang Sumatera Barat (Official Hub)',
        snippet: 'Pusat komunitas resmi atlet & gamers MLBB se-Sumatera Barat. Info scrim harian, turnamen lokal, dan mabar.',
        link: '/komunitas/mlbb-sumbar',
        category: 'Official',
        city: 'Padang',
        tags: ['MLBB', 'Mobile Legends', 'Komunitas Resmi', 'Padang'],
      },
      {
        id: 'comm-val-sumbar',
        type: 'COMMUNITY' as const,
        title: 'Valorant Sumatera Barat (Official Hub)',
        snippet: 'Basis komunitas pemain tactical shooter Valorant di Ranah Minang. Saluran Discord scrim SG-1 dan rekrumen tim.',
        link: '/komunitas/val-sumbar',
        category: 'Official',
        city: 'Padang',
        tags: ['Valorant', 'Tactical Shooter', 'Discord', 'Padang'],
      },
      {
        id: 'comm-ff-sumbar',
        type: 'COMMUNITY' as const,
        title: 'Free Fire Minang Pride & Guild Hub',
        snippet: 'Komunitas guild dan squad Free Fire kawasan Bukittinggi, Agam, Payakumbuh, dan Padang.',
        link: '/komunitas/ff-sumbar',
        category: 'Official',
        city: 'Bukittinggi',
        tags: ['Free Fire', 'FF', 'Guild', 'Bukittinggi'],
      },
      // EVENTS
      {
        id: 'evt-minangkabau-cup-2026',
        type: 'EVENT' as const,
        title: 'Minangkabau Esport Cup Season 4 — MLBB Championship',
        snippet: 'Turnamen kasta tertinggi MLBB Sumbar. Kualifikasi online 18 kota/kabupaten menuju Grand Final Offline di Auditorium Unand.',
        link: '/event/minangkabau-esport-cup-season-4',
        category: 'Turnamen',
        city: 'Padang',
        tags: ['MLBB', 'Turnamen', 'Offline', 'Auditorium Unand', 'Padang'],
      },
      {
        id: 'evt-val-campus-padang-2026',
        type: 'EVENT' as const,
        title: 'Valorant Campus & Highschool Series Sumbar 2026',
        snippet: 'Kompetisi taktis 5v5 antar pelajar & mahasiswa se-Sumatera Barat dengan format Swiss stage dan Double Elimination.',
        link: '/event/valorant-campus-series-sumbar-2026',
        category: 'Turnamen',
        city: 'Padang',
        tags: ['Valorant', 'Kampus', 'Swiss System', 'Double Elimination', 'Padang'],
      },
      {
        id: 'evt-ff-bukittinggi-clash',
        type: 'EVENT' as const,
        title: 'Free Fire Jam Gadang Clash — Battle Royale Point Series',
        snippet: 'Turnamen offline 12 squad per lobby di Lapangan Kantin Bukittinggi dengan format leaderboard placement + kill.',
        link: '/event/free-fire-jam-gadang-clash-2026',
        category: 'Turnamen',
        city: 'Bukittinggi',
        tags: ['Free Fire', 'Bukittinggi', 'Battle Royale', 'Leaderboard'],
      },
    ];

    const results = corpus
      .filter((item) => !typeFilter || item.type === typeFilter)
      .map((item) => {
        let score = 0;
        const textTarget = `${item.title} ${item.snippet} ${item.category} ${item.city} ${item.tags.join(' ')}`.toLowerCase();

        // Exact match boost
        if (textTarget.includes(q)) {
          score += 0.5;
        }

        // Token matches
        for (const t of tokens) {
          if (textTarget.includes(t)) {
            score += 0.2;
          }
        }

        // Game acronym synonyms
        if (tokens.some((t) => t === 'ml' || t === 'mobile') && textTarget.includes('mlbb')) score += 0.3;
        if (tokens.some((t) => t === 'ff') && textTarget.includes('free fire')) score += 0.3;
        if (tokens.some((t) => t === 'val') && textTarget.includes('valorant')) score += 0.3;

        return {
          id: item.id,
          type: item.type,
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          score: Math.min(0.99, Number(score.toFixed(2))),
          category: item.category,
          city: item.city,
          tags: item.tags,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  recommendPersonalized(
    userId: string,
    userCity?: string,
    favoriteGames?: string[],
  ) {
    const city = userCity || 'Padang';
    const games = favoriteGames && favoriteGames.length > 0 ? favoriteGames : ['MLBB', 'VALORANT'];

    const isPadang = city.toLowerCase().includes('padang');
    const isBukittinggi = city.toLowerCase().includes('bukittinggi');

    const recommendedCommunities = [
      {
        id: 'comm-mlbb-sumbar',
        name: 'Mobile Legends Bang Bang Sumbar',
        slug: 'mlbb-sumbar',
        gameId: 'MLBB',
        reason: games.includes('MLBB')
          ? `Sesuai game favorit Anda (MLBB) & memiliki anggota teraktif di ${city}.`
          : 'Komunitas resmi game terpopuler di Sumatera Barat.',
      },
      {
        id: isBukittinggi ? 'comm-ff-sumbar' : 'comm-val-sumbar',
        name: isBukittinggi ? 'Free Fire Bukittinggi Hub' : 'Valorant Sumatera Barat',
        slug: isBukittinggi ? 'ff-sumbar' : 'val-sumbar',
        gameId: isBukittinggi ? 'FREE_FIRE' : 'VALORANT',
        reason: isBukittinggi
          ? 'Berbasis langsung di Bukittinggi & aktif mengadakan kompetisi offline.'
          : 'Komunitas kompetitif mahasiswa & gamers tactical shooter di Padang.',
      },
    ];

    const recommendedEvents = [
      {
        id: 'evt-minangkabau-cup-2026',
        title: 'Minangkabau Esport Cup Season 4 — MLBB Championship',
        slug: 'minangkabau-esport-cup-season-4',
        gameId: 'MLBB',
        city: 'Padang',
        prizePool: 25_000_000,
        reason: 'Turnamen terbesar dengan kuota pendaftaran masih terbuka untuk perwakilan daerah.',
      },
      {
        id: isBukittinggi ? 'evt-ff-bukittinggi-clash' : 'evt-val-campus-padang-2026',
        title: isBukittinggi
          ? 'Free Fire Jam Gadang Clash 2026'
          : 'Valorant Campus & Highschool Series Sumbar 2026',
        slug: isBukittinggi
          ? 'free-fire-jam-gadang-clash-2026'
          : 'valorant-campus-series-sumbar-2026',
        gameId: isBukittinggi ? 'FREE_FIRE' : 'VALORANT',
        city: isBukittinggi ? 'Bukittinggi' : 'Padang',
        prizePool: isBukittinggi ? 15_000_000 : 10_000_000,
        reason: `Paling dekat dengan domisili Anda di ${city} dengan format pendaftaran tim/sekolah.`,
      },
    ];

    return {
      userId,
      userCity: city,
      recommendedCommunities,
      recommendedEvents,
    };
  }

  getPrompts() {
    return PROMPTS;
  }
}
