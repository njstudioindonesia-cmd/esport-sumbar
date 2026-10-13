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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InstagramConnectorService } from './instagram-connector.service';

@ApiTags('Instagram Graph API Connector')
@Controller('instagram')
export class InstagramController {
  constructor(private readonly connector: InstagramConnectorService) {}

  @Get('connection')
  @ApiOperation({ summary: 'Mendapatkan status koneksi, token, dan sinkronisasi Instagram' })
  getConnectionStatus() {
    return this.connector.getConnectionStatus();
  }

  @Patch('mode')
  @ApiOperation({ summary: 'Mengubah mode publikasi feed Instagram (REVIEW atau AUTO)' })
  setMode(@Body('mode') mode: 'REVIEW' | 'AUTO') {
    if (mode !== 'REVIEW' && mode !== 'AUTO') {
      throw new BadRequestException('Mode harus REVIEW atau AUTO');
    }
    return this.connector.setPublishMode(mode);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Memperbarui (renew) masa aktif Long-Lived Token Instagram' })
  async refreshToken() {
    return this.connector.refreshToken();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Memicu sinkronisasi manual media dari Instagram @esportsumbar' })
  async syncNow() {
    return this.connector.syncInstagramFeeds();
  }

  @Get('drafts')
  @ApiOperation({ summary: 'Mendapatkan daftar EventDraft hasil ekstraksi postingan Instagram' })
  getDrafts() {
    return this.connector.getEventDrafts();
  }

  @Patch('drafts/:id/status')
  @ApiOperation({ summary: 'Menyetujui (APPROVED) atau menolak (REJECTED) EventDraft Instagram' })
  updateDraftStatus(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      throw new BadRequestException('Status harus APPROVED atau REJECTED');
    }
    const updated = this.connector.updateEventDraftStatus(id, status);
    if (!updated) {
      throw new BadRequestException(`EventDraft dengan ID ${id} tidak ditemukan`);
    }
    return updated;
  }

  // Meta Webhook Endpoints
  @Get('webhook')
  @ApiOperation({ summary: 'Verifikasi webhook dari Meta Graph API (hub.challenge)' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // Return challenge if verify_token matches
    if (mode === 'subscribe' && token === 'esportsumbar_secret_verify_token') {
      return challenge;
    }
    throw new BadRequestException('Verifikasi webhook Meta gagal: token tidak cocok');
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Menerima pembaruan media instan dari webhook Meta' })
  async handleWebhookPayload(@Body() payload: any) {
    // When a new media entry is published on @esportsumbar, trigger auto-sync
    if (payload?.entry) {
      await this.connector.syncInstagramFeeds();
    }
    return { received: true };
  }
}
