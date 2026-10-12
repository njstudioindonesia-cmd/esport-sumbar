import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventService, SubmitRegistrationDto } from './event.service';

@ApiTags('Public Events & Registration')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({
    summary:
      'Katalog event esport (Sumbar, Nasional, Global) dengan filter game, mode, status & pencarian',
  })
  listEvents(
    @Query('scope') scope?: string,
    @Query('gameId') gameId?: string,
    @Query('mode') mode?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('communityId') communityId?: string,
  ) {
    return this.eventService.listPublicEvents({
      scope,
      gameId,
      mode,
      status,
      search,
      communityId,
    });
  }

  @Get(':slugOrId')
  @ApiOperation({
    summary:
      'Detail event publik beserta form pendaftaran, daftar peserta approved, pengumuman & analitik',
  })
  getEventDetail(@Param('slugOrId') slugOrId: string) {
    return this.eventService.getEventDetail(slugOrId);
  }

  @Post(':slugOrId/register')
  @ApiOperation({
    summary:
      'Pendaftaran peserta individu/tim dengan validasi dinamis terhadap schema Form Builder EO',
  })
  registerForEvent(
    @Param('slugOrId') slugOrId: string,
    @Body() body: SubmitRegistrationDto,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const payload: SubmitRegistrationDto = {
      ...body,
      userId: body.userId || headerUserId || `user-guest-${Date.now()}`,
      userNickname: body.userNickname || 'PlayerSumbar',
    };
    return this.eventService.submitRegistration(slugOrId, payload);
  }
}
