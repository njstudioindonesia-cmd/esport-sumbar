import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnvConfig } from '../config/env.config';
import { ENV_CONFIG_TOKEN } from '../config/config.module';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(@Inject(ENV_CONFIG_TOKEN) private readonly config: EnvConfig) {}

  @Get()
  @ApiOperation({ summary: 'Gateway Health Check' })
  @ApiResponse({ status: 200, description: 'Gateway is healthy' })
  check() {
    const mem = process.memoryUsage();
    return {
      status: 'ok',
      service: this.config.SERVICE_NAME,
      version: this.config.SERVICE_VERSION,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      upstream: {
        identityService: this.config.IDENTITY_SERVICE_URL,
        newsService: this.config.NEWS_SERVICE_URL,
        aiService: this.config.AI_SERVICE_URL,
        newsIngestor: this.config.NEWS_INGESTOR_URL,
        communityService: this.config.COMMUNITY_SERVICE_URL,
        eventService: this.config.EVENT_SERVICE_URL,
        mediaService: this.config.MEDIA_SERVICE_URL,
        bracketService: this.config.BRACKET_SERVICE_URL,
        notificationService: this.config.NOTIFICATION_SERVICE_URL,
      },
      memoryUsageMb: {
        rss: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsed: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
