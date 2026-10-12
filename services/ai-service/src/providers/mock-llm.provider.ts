import { Injectable } from '@nestjs/common';
import { ILlmProvider, LlmCompletionResult } from './llm-provider.interface';

@Injectable()
export class MockLlmProvider implements ILlmProvider {
  readonly name = 'mock-curator-engine';

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    _temperature?: number,
  ): Promise<LlmCompletionResult> {
    const startTime = Date.now();

    // Check if curator task or moderator task
    if (
      systemPrompt.includes('NEWS_CURATOR') ||
      systemPrompt.includes('Curator AI') ||
      systemPrompt.includes('Esports Journalist')
    ) {
      let rawData: any = {};
      try {
        rawData = JSON.parse(userPrompt);
      } catch {
        rawData = { title: userPrompt, content: userPrompt };
      }

      const title = rawData.rawTitle || rawData.title || 'Kabar Terbaru Esport Sumatera Barat';
      const cleanSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const isSumbar =
        title.toLowerCase().includes('sumbar') ||
        title.toLowerCase().includes('padang') ||
        title.toLowerCase().includes('bukittinggi') ||
        (rawData.rawContent || '').toLowerCase().includes('sumatera barat');

      const category = isSumbar ? 'Sumbar' : 'Indonesia';
      const sourceName = rawData.sourceName || 'Esport Media Indonesia';
      const sourceUrl = rawData.sourceUrl || 'https://esport-sumbar.id/berita-sumber';

      const structuredResult = {
        title: `[ESPORT SUMBAR] ${title}`,
        slug: `${cleanSlug}-${Date.now().toString(36)}`,
        summary: `Perkembangan mutakhir skena esport: ${title}. Liputan mendalam mengenai jalannya pertandingan, strategi tim, dan dampaknya bagi atlet komunitas lokal.`,
        body: `RANAH MINANG — Kompetisi esport kembali memanas dengan hadirnya kabar terbaru: "${title}". Para atlet dan komunitas menyambut antusias pembaruan ini.\n\nDalam wawancara eksklusif dan data pertandingan resmi dari ${sourceName}, dinamika turnamen menunjukkan peningkatan level persaingan yang signifikan. Berbagai guild dan tim kini mengintensifkan jadwal scrim harian guna mengantisipasi babak eliminasi mendatang.\n\nInformasi lebih lanjut dan jadwal pertandingan lengkap dapat diakses melalui portal resmi ESPORT SUMBAR.`,
        sourceName,
        sourceUrl,
        category,
        gameId: rawData.gameId || 'Mobile Legends',
        tags: ['Esport', category, 'Turnamen', 'Kompetitif'],
        viralScore: Math.floor(Math.random() * 25) + 75, // 75 - 100
        aiConfidence: 0.95,
        suggestedStatus: 'REVIEW',
      };

      const latencyMs = Date.now() - startTime + 45;

      return {
        content: JSON.stringify(structuredResult),
        provider: this.name,
        usage: {
          promptTokens: 420,
          completionTokens: 260,
          totalTokens: 680,
          latencyMs,
          estimatedCostUsd: 0.0012,
        },
      };
    }

    // Default to moderation engine
    const textToCheck = userPrompt.toLowerCase();
    const isJudi = textToCheck.includes('slot') || textToCheck.includes('gacor') || textToCheck.includes('judi');
    const isToxic = textToCheck.includes('anjing') || textToCheck.includes('babi') || textToCheck.includes('kontol');

    const flaggedCategories: string[] = [];
    if (isJudi) flaggedCategories.push('judi');
    if (isToxic) flaggedCategories.push('toxic');

    const approved = flaggedCategories.length === 0;

    return {
      content: JSON.stringify({
        approved,
        decision: approved ? 'APPROVE' : 'REJECT',
        reason: approved ? 'Konten aman' : `Terdeteksi pelanggaran: ${flaggedCategories.join(', ')}`,
        categoriesFlagged: flaggedCategories,
      }),
      provider: this.name,
      usage: {
        promptTokens: 150,
        completionTokens: 50,
        totalTokens: 200,
        latencyMs: Date.now() - startTime + 20,
        estimatedCostUsd: 0.0003,
      },
    };
  }
}
