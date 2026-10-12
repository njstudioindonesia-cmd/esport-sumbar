import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { CommunityModule } from './community.module';

@Module({
  imports: [ConfigModule, HealthModule, CommunityModule],
})
export class AppModule {}
