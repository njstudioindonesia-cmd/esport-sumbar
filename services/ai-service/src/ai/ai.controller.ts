import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { NewsIngestedPayloadSchema } from '@esport-sumbar/contracts';
import { z } from 'zod';

const ModerateRequestSchema = z.object({
  text: z.string().min(1),
});

@ApiTags('AI Engine')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('curate-news')
  @ApiOperation({ summary: 'Evaluasi & tulis ulang berita mentah dengan format orisinal dan skor viral' })
  @ApiResponse({ status: 200, description: 'Berita berhasil dikurasi' })
  async curateNews(@Body() rawBody: unknown) {
    const parse = NewsIngestedPayloadSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format data input berita mentah tidak valid',
        details: parse.error.format(),
      });
    }
    return this.aiService.curateNews(parse.data);
  }

  @Post('moderate')
  @ApiOperation({ summary: 'Moderasi konten teks (anti-toxic, anti-SARA, anti-judi online)' })
  @ApiResponse({ status: 200, description: 'Hasil evaluasi keamanan konten' })
  async moderate(@Body() rawBody: unknown) {
    const parse = ModerateRequestSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException('Teks untuk moderasi tidak boleh kosong');
    }
    return this.aiService.moderateContent(parse.data.text);
  }

  @Get('prompts')
  @ApiOperation({ summary: 'Mendapatkan daftar versi prompt aktif di AI Service' })
  getPrompts() {
    return this.aiService.getPrompts();
  }

  @Post('eo-assistant')
  @ApiOperation({
    summary:
      'EO AI Assistant: generate judul, deskripsi, rulebook, format bracket & form builder dari prompt',
  })
  async generateEoAssistant(
    @Body() body: { prompt: string; context?: Record<string, unknown> },
  ) {
    if (!body?.prompt?.trim()) {
      throw new BadRequestException('Prompt EO tidak boleh kosong');
    }
    return this.aiService.generateEoPackage(body.prompt, body.context);
  }

  @Post('search')
  @ApiOperation({
    summary:
      'Smart Semantic Search: pencarian cerdas berbasis kecocokan semantik lintas berita, komunitas & event',
  })
  async searchSemanticPost(
    @Body()
    body: {
      query: string;
      type?: 'NEWS' | 'COMMUNITY' | 'EVENT';
      topK?: number;
    },
  ) {
    if (!body?.query?.trim()) {
      throw new BadRequestException('Query pencarian tidak boleh kosong');
    }
    return this.aiService.searchSemantic(body.query, body.type, body.topK);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Smart Search via query string (q, type, topK)',
  })
  async searchSemanticGet(
    @Query('q') q?: string,
    @Query('type') type?: 'NEWS' | 'COMMUNITY' | 'EVENT',
    @Query('topK') topK?: number,
  ) {
    if (!q?.trim()) {
      return [];
    }
    return this.aiService.searchSemantic(
      q,
      type,
      topK ? Number(topK) : undefined,
    );
  }

  @Get('recommendations')
  @ApiOperation({
    summary:
      'Rekomendasi personalisasi AI untuk event & komunitas berdasarkan kota & game pengguna',
  })
  async getRecommendations(
    @Query('userId') userId?: string,
    @Query('city') city?: string,
    @Query('games') games?: string,
  ) {
    const gamesList = games ? games.split(',').map((g) => g.trim()) : undefined;
    return this.aiService.recommendPersonalized(
      userId || 'user-guest',
      city || 'Padang',
      gamesList,
    );
  }
}
