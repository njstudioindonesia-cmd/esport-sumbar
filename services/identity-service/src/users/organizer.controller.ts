import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/token.service';
import { ApplyOrganizerDtoSchema } from '@esport-sumbar/contracts';
import { OrganizerProfileEntity } from '../database/models';
import { z } from 'zod';

const VerifyOrganizerDtoSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
});

@ApiTags('Organizer & Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class OrganizerController {
  constructor(private readonly usersService: UsersService) {}

  @Post('organizer/apply')
  @ApiOperation({ summary: 'Mengajukan upgrade akun menjadi Event Organizer' })
  @ApiResponse({ status: 201, description: 'Pengajuan EO berhasil dikirim' })
  async apply(
    @CurrentUser() user: JwtPayload,
    @Body() rawBody: unknown,
  ): Promise<OrganizerProfileEntity> {
    const parse = ApplyOrganizerDtoSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Validasi dokumen pengajuan EO gagal',
        details: parse.error.format(),
      });
    }
    return this.usersService.applyOrganizer(user.sub, parse.data);
  }

  @Get('organizer/status')
  @ApiOperation({ summary: 'Mengecek status pengajuan EO akun saat ini' })
  @ApiResponse({ status: 200, description: 'Status berhasil didapatkan' })
  async getStatus(@CurrentUser() user: JwtPayload): Promise<OrganizerProfileEntity | null> {
    return this.usersService.getOrganizerStatus(user.sub);
  }

  @Get('admin/organizer/applications')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: melihat daftar pengajuan EO yang menunggu verifikasi' })
  @ApiResponse({ status: 200, description: 'Daftar pengajuan berhasil didapatkan' })
  async listPending(): Promise<OrganizerProfileEntity[]> {
    return this.usersService.listPendingApplications();
  }

  @Patch('admin/organizer/applications/:id/verify')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: verifikasi (approve / reject) pengajuan EO' })
  @ApiResponse({ status: 200, description: 'Pengajuan berhasil diproses' })
  async verify(
    @Param('id') id: string,
    @CurrentUser() admin: JwtPayload,
    @Body() rawBody: unknown,
  ): Promise<OrganizerProfileEntity> {
    const parse = VerifyOrganizerDtoSchema.safeParse(rawBody);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Format keputusan verifikasi tidak valid',
        details: parse.error.format(),
      });
    }
    return this.usersService.verifyApplication(id, parse.data.decision, admin.sub, parse.data.reason);
  }
}
