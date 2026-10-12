import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaService, UploadMediaInput } from './media.service';
import { MediaFileCategory } from '@esport-sumbar/contracts';

@ApiTags('Media & Event Storage')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('events/:eventId/storage')
  @ApiOperation({
    summary: 'Lihat ringkasan kuota & daftar file storage khusus per event (Tenant Isolated)',
  })
  getEventStorage(
    @Param('eventId') eventId: string,
    @Query('organizerId') organizerId?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const requesterId = organizerId || headerUserId || 'user-eo-1';
    return this.mediaService.getEventStorage(eventId, requesterId, headerUserRole);
  }

  @Post('events/:eventId/upload')
  @ApiOperation({
    summary: 'Upload metadata/file ke bucket terisolasi event dengan validasi MIME & kuota',
  })
  uploadToEvent(
    @Param('eventId') eventId: string,
    @Body()
    body: {
      ownerId?: string;
      organizerId?: string;
      fileName: string;
      sizeBytes: number;
      mimeType: string;
      category: MediaFileCategory;
      visibility?: 'PRIVATE' | 'PUBLIC';
    },
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const input: UploadMediaInput = {
      ownerId: body.ownerId || headerUserId || 'user-eo-1',
      requesterRole: headerUserRole,
      eventId,
      organizerId: body.organizerId,
      fileName: body.fileName,
      sizeBytes: Number(body.sizeBytes),
      mimeType: body.mimeType,
      category: body.category,
      visibility: body.visibility,
    };
    return this.mediaService.uploadFile(input);
  }

  @Post('files/:fileId/signed-url')
  @ApiOperation({
    summary: 'Buat Signed URL sementara (15 menit) untuk akses file privat/bukti bayar',
  })
  createSignedUrl(
    @Param('fileId') fileId: string,
    @Body() body: { requesterId?: string; expiresInSeconds?: number },
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const requesterId = body?.requesterId || headerUserId || 'user-eo-1';
    return this.mediaService.generateSignedUrl(
      fileId,
      requesterId,
      headerUserRole,
      body?.expiresInSeconds ?? 900,
    );
  }

  @Get('download/:fileId')
  @ApiOperation({ summary: 'Verifikasi dan unduh file menggunakan Signed URL' })
  downloadWithSignedUrl(
    @Param('fileId') fileId: string,
    @Query('expires') expires: string,
    @Query('sig') sig: string,
  ) {
    return this.mediaService.verifyAndDownload(fileId, expires, sig);
  }

  @Delete('files/:fileId')
  @ApiOperation({ summary: 'Hapus file dari storage event (Hanya EO pemilik event)' })
  deleteFile(
    @Param('fileId') fileId: string,
    @Query('organizerId') organizerId?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const requesterId = organizerId || headerUserId || 'user-eo-1';
    return this.mediaService.deleteFile(fileId, requesterId, headerUserRole);
  }
}
