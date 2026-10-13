import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [],
  controllers: [HealthController, NotificationController],
  providers: [NotificationService],
})
export class AppModule {}
