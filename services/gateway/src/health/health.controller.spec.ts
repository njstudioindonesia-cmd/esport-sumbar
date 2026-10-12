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
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX_REQUESTS: 100,
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
    expect(res.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.memoryUsageMb.rss).toBeGreaterThan(0);
  });
});
