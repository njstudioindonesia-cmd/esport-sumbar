import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { IngestModule } from './ingest/ingest.module';

@Module({
  imports: [ConfigModule, HealthModule, IngestModule],
})
export class AppModule {}
