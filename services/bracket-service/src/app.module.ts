import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { BracketController } from './bracket.controller';
import { BracketService } from './bracket.service';

@Module({
  imports: [],
  controllers: [HealthController, BracketController],
  providers: [BracketService],
})
export class AppModule {}
