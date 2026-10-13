import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { IngestModule } from './ingest/ingest.module';
import { InstagramModule } from './instagram/instagram.module';

@Module({
  imports: [ConfigModule, HealthModule, IngestModule, InstagramModule],
})
export class AppModule {}
