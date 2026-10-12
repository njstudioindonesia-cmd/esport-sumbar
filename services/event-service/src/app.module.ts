import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { EventRepository } from './database/event.repository';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EoEventController } from './eo-event.controller';

@Module({
  imports: [],
  controllers: [HealthController, EventController, EoEventController],
  providers: [EventRepository, EventService],
})
export class AppModule {}
