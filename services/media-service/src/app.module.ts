import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [],
  controllers: [HealthController, MediaController],
  providers: [MediaService],
})
export class AppModule {}
