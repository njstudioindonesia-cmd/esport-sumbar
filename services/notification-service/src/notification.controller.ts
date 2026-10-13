import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService, SendNotificationDto } from './notification.service';

@ApiTags('Notifications & Event Reminders')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar notifikasi in-app untuk pengguna beserta counter unread',
  })
  getUserNotifications(
    @Query('userId') queryUserId?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = queryUserId || headerUserId || 'user-member-1';
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Tandai notifikasi spesifik sudah dibaca' })
  markRead(
    @Param('id') id: string,
    @Query('userId') queryUserId?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = queryUserId || headerUserId;
    return this.notificationService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Tandai seluruh notifikasi pengguna sudah dibaca' })
  markAllRead(
    @Query('userId') queryUserId?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = queryUserId || headerUserId || 'user-member-1';
    return this.notificationService.markAllAsRead(userId);
  }

  @Post('send')
  @ApiOperation({ summary: 'Kirim notifikasi in-app atau email ke pengguna' })
  sendNotification(@Body() body: SendNotificationDto) {
    return this.notificationService.sendNotification(body);
  }

  @Post('event-reminder')
  @Post('remind-tournament')
  @ApiOperation({
    summary: 'Trigger pengingat jadwal turnamen / technical meeting ke seluruh peserta',
  })
  triggerEventReminder(
    @Body()
    body: {
      eventId: string;
      eventTitle: string;
      participantUserIds: string[];
    },
  ) {
    return this.notificationService.triggerEventReminder(
      body.eventId,
      body.eventTitle,
      body.participantUserIds || ['user-member-1', 'user-member-2'],
    );
  }
}
