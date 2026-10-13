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

    // EO Assistant task
    if (systemPrompt.includes('EO_ASSISTANT') || systemPrompt.includes('Tournament Architect')) {
      const lower = userPrompt.toLowerCase();
      const isBr = lower.includes('battle royale') || lower.includes('free fire') || lower.includes('pubg');
      const isVal = lower.includes('valorant');
      const gameTitle = isBr ? 'Free Fire' : isVal ? 'Valorant' : 'Mobile Legends: Bang Bang';
      const cityMention = lower.includes('bukittinggi') ? 'Bukittinggi' : lower.includes('payakumbuh') ? 'Payakumbuh' : 'Padang';

      const format = isBr ? 'LEADERBOARD' : isVal ? 'SWISS' : 'DOUBLE_ELIMINATION';

      const eoResult = {
        title: `Piala Ranah Minang ${gameTitle} Championship 2026`,
        description: `Turnamen esport resmi bergengsi di ${cityMention}, Sumatera Barat yang mempertemukan talenta-talenta muda berbakat se-Ranah Minang. Diselenggarakan dengan standar kompetisi profesional untuk mengasah sportivitas dan strategi tim.\n\nBabak penyisihan berlangsung secara kompetitif menuju Grand Final LAN yang disiarkan langsung melalui portal resmi ESPORT SUMBAR. Raih total hadiah jutaan rupiah dan trofi bergengsi kebanggaan daerah!\n\nSeluruh peserta diwajibkan mematuhi kode etik kompetisi dan jadwal technical meeting panitia.`,
        rulebook: `1. KETENTUAN UMUM: Setiap tim wajib terdiri dari 5 pemain inti dan maksimal 1 cadangan. Seluruh pemain dilarang menggunakan emulator PC / tablet khusus pada cabang mobile.\n2. SISTEM PERTANDINGAN: Menggunakan format ${format} dengan Best of 3 pada babak eliminasi.\n3. ATURAN PAUSE: Masing-masing tim memiliki jatah 2x tactical pause (maksimal 3 menit per pause) dengan melapor kepada wasit pertandingan.\n4. KODE ETIK & INTEGRITAS: Segala bentuk cheat, maphack, bug exploitation, joki akun, serta toxic/chat kasar berakibat diskualifikasi langsung tanpa pengembalian biaya pendaftaran.\n5. JADWAL & CHECK-IN: Seluruh kapten tim wajib hadir di Discord technical meeting H-1 dan melakukan check-in paling lambat 30 menit sebelum match dimulai.`,
        recommendedFormat: format,
        recommendedBestOf: isBr ? 4 : 3,
        prizeDistribution: 'Juara 1: Rp 7.500.000 + Trofi Juara · Juara 2: Rp 4.500.000 + Medali · Juara 3: Rp 2.000.000 + Sertifikat · MVP Player: Rp 1.000.000',
        suggestedFormFields: [
          'ID Game & Nomor Server Kapten',
          'Nomor WhatsApp Aktif Kapten',
          'Kabupaten/Kota Asal Tim di Sumatera Barat',
          'Kartu Identitas (KTP / Kartu Pelajar / KTM Mahasiswa)',
        ],
      };

      return {
        content: JSON.stringify(eoResult),
        provider: this.name,
        usage: {
          promptTokens: 520,
          completionTokens: 380,
          totalTokens: 900,
          latencyMs: Date.now() - startTime + 60,
          estimatedCostUsd: 0.0018,
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
