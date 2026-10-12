import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEventDto, EventService } from './event.service';
import {
  EventItem,
  FormField,
  RegistrationStatus,
} from '@esport-sumbar/contracts';

@ApiTags('EO Dashboard & Tools (Tenant Isolated)')
@Controller('eo')
export class EoEventController {
  constructor(private readonly eventService: EventService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Ringkasan dashboard Event Organizer beserta analitik pendaftar & sebaran kota Sumbar (Tenant Isolated)',
  })
  getDashboard(
    @Query('organizerId') queryOrganizerId?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = queryOrganizerId || headerUserId || 'user-eo-1';
    return this.eventService.listEoDashboard(organizerId, headerUserRole);
  }

  @Post('events')
  @ApiOperation({
    summary: 'Buat event baru beserta Form Builder pendaftaran default',
  })
  createEvent(
    @Body()
    body: CreateEventDto & {
      organizerId?: string;
      organizerName?: string;
    },
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const organizerId = body.organizerId || headerUserId || 'user-eo-1';
    const organizerName = body.organizerName || 'Minang Pro Organizer';
    return this.eventService.createEvent(organizerId, organizerName, body);
  }

  @Get('events/:eventId')
  @ApiOperation({
    summary:
      'Detail manajemen event EO: form builder, seluruh pendaftar, pengumuman & analitik (Tenant Isolated)',
  })
  getEoEvent(
    @Param('eventId') eventId: string,
    @Query('organizerId') queryOrganizerId?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = queryOrganizerId || headerUserId || 'user-eo-1';
    return this.eventService.getEoEventManagement(
      eventId,
      organizerId,
      headerUserRole,
    );
  }

  @Patch('events/:eventId')
  @ApiOperation({
    summary: 'Update informasi event (Hanya EO pemilik event)',
  })
  updateEvent(
    @Param('eventId') eventId: string,
    @Body() body: Partial<EventItem> & { organizerId?: string },
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = body.organizerId || headerUserId || 'user-eo-1';
    return this.eventService.updateEvent(
      eventId,
      organizerId,
      headerUserRole,
      body,
    );
  }

  @Put('events/:eventId/form')
  @ApiOperation({
    summary:
      'Simpan konfigurasi Form Builder pendaftaran (schema JSON, kuota, batas waktu, biaya)',
  })
  updateForm(
    @Param('eventId') eventId: string,
    @Body()
    body: {
      organizerId?: string;
      fields?: FormField[];
      quota?: number;
      deadline?: string;
      fee?: number;
      paymentInstructions?: string;
      requirePaymentProof?: boolean;
    },
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = body.organizerId || headerUserId || 'user-eo-1';
    return this.eventService.updateRegistrationForm(
      eventId,
      organizerId,
      headerUserRole,
      body,
    );
  }

  @Patch('events/:eventId/participants/:registrationId/status')
  @ApiOperation({
    summary:
      'Ubah status peserta (APPROVED / REJECTED / WAITLIST / PENDING) dengan Tenant Isolation',
  })
  updateParticipantStatus(
    @Param('eventId') eventId: string,
    @Param('registrationId') registrationId: string,
    @Body()
    body: {
      organizerId?: string;
      status: RegistrationStatus;
      rejectionReason?: string;
    },
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = body.organizerId || headerUserId || 'user-eo-1';
    return this.eventService.updateParticipantStatus(
      eventId,
      registrationId,
      organizerId,
      headerUserRole,
      body,
    );
  }

  @Post('events/:eventId/participants/:registrationId/check-in')
  @ApiOperation({
    summary: 'Toggle status Check-In kehadiran ulang peserta/tim',
  })
  toggleCheckIn(
    @Param('eventId') eventId: string,
    @Param('registrationId') registrationId: string,
    @Body() body: { organizerId?: string },
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = body?.organizerId || headerUserId || 'user-eo-1';
    return this.eventService.toggleParticipantCheckIn(
      eventId,
      registrationId,
      organizerId,
      headerUserRole,
    );
  }

  @Get('events/:eventId/participants/export-csv')
  @ApiOperation({
    summary:
      'Export daftar peserta beserta jawaban custom Form Builder ke CSV (Tenant Isolated)',
  })
  exportCsv(
    @Param('eventId') eventId: string,
    @Query('organizerId') queryOrganizerId?: string,
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = queryOrganizerId || headerUserId || 'user-eo-1';
    return this.eventService.exportParticipantsCsv(
      eventId,
      organizerId,
      headerUserRole,
    );
  }

  @Post('events/:eventId/announcements')
  @ApiOperation({
    summary: 'Kirim pengumuman penting ke halaman event & seluruh peserta',
  })
  createAnnouncement(
    @Param('eventId') eventId: string,
    @Body()
    body: {
      organizerId?: string;
      title: string;
      content: string;
      important?: boolean;
    },
    @Headers('x-user-id') headerUserId?: string,
    @Headers('x-user-role') headerUserRole?: string,
  ) {
    const organizerId = body.organizerId || headerUserId || 'user-eo-1';
    return this.eventService.createAnnouncement(
      eventId,
      organizerId,
      headerUserRole,
      body,
    );
  }
}
