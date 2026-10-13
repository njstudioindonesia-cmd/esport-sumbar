import { HealthController } from './health.controller';
import { EnvConfig } from '../config/env.config';

describe('Gateway HealthController', () => {
  let controller: HealthController;

  const mockConfig: EnvConfig = {
    NODE_ENV: 'test',
    PORT: 4000,
    SERVICE_NAME: 'api-gateway',
    SERVICE_VERSION: '0.1.0',
    CORS_ORIGIN: '*',
    IDENTITY_SERVICE_URL: 'http://localhost:4001',
    NEWS_SERVICE_URL: 'http://localhost:4002',
    AI_SERVICE_URL: 'http://localhost:4008',
    NEWS_INGESTOR_URL: 'http://localhost:4003',
    COMMUNITY_SERVICE_URL: 'http://localhost:4004',
    EVENT_SERVICE_URL: 'http://localhost:4005',
    MEDIA_SERVICE_URL: 'http://localhost:4006',
    BRACKET_SERVICE_URL: 'http://localhost:4007',
    NOTIFICATION_SERVICE_URL: 'http://localhost:4009',
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    JWT_ACCESS_SECRET: 'test_jwt_secret_12345',
  };

  beforeEach(() => {
    controller = new HealthController(mockConfig);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return valid gateway health status and upstream info', () => {
    const res = controller.check();
    expect(res.status).toBe('ok');
    expect(res.service).toBe('api-gateway');
    expect(res.upstream.identityService).toBe('http://localhost:4001');
    expect(res.upstream.newsService).toBe('http://localhost:4002');
    expect(res.upstream.aiService).toBe('http://localhost:4008');
    expect(res.upstream.newsIngestor).toBe('http://localhost:4003');
    expect(res.upstream.communityService).toBe('http://localhost:4004');
    expect(res.upstream.eventService).toBe('http://localhost:4005');
    expect(res.upstream.mediaService).toBe('http://localhost:4006');
    expect(res.upstream.bracketService).toBe('http://localhost:4007');
    expect(res.upstream.notificationService).toBe('http://localhost:4009');
    expect(res.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.memoryUsageMb.rss).toBeGreaterThan(0);
  });

  it('should return valid Prometheus metrics string', () => {
    const prom = controller.metrics();
    expect(prom).toContain('esport_gateway_uptime_seconds{service="api-gateway"}');
    expect(prom).toContain('esport_gateway_memory_rss_bytes{service="api-gateway"}');
  });
});
