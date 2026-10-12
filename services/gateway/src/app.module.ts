import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { ProxyService } from './proxy/proxy.service';

@Module({
  imports: [ConfigModule, HealthModule],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class AppModule {}
