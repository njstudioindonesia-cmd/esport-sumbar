import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { NewsModule } from './news.module';

@Module({
  imports: [ConfigModule, HealthModule, NewsModule],
})
export class AppModule {}
