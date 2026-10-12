import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
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
}
