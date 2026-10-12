import { Controller, Get, Patch, Param, Query, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';

@ApiTags('Admin & Moderator Content Safety')
@Controller('admin/moderation')
export class AdminModerationController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('reports')
  @ApiOperation({ summary: 'Mendapatkan antrean laporan konten komunitas & tangkapan AI Moderator' })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] })
  async getReports(@Query('status') status?: string) {
    return this.communityService.listReports(status);
  }

  @Patch('reports/:id')
  @ApiOperation({ summary: 'Menindaklanjuti laporan (RESOLVED = hapus konten, DISMISSED = abaikan)' })
  async resolveReport(
    @Param('id') id: string,
    @Body('status') status: 'RESOLVED' | 'DISMISSED',
  ) {
    if (!status || !['RESOLVED', 'DISMISSED'].includes(status)) {
      throw new BadRequestException('Status harus RESOLVED atau DISMISSED');
    }
    return this.communityService.resolveReport(id, status);
  }
}
