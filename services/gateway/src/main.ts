import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.config';
import { ProxyService } from './proxy/proxy.service';
import { StructuredLogger, getOrGenerateCorrelationId, CORRELATION_HEADER } from '@esport-sumbar/utils';

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env);
  const logger = new StructuredLogger(env.SERVICE_NAME);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Allows swagger UI & proxy
  }));

  // CORS
  app.enableCors({
    origin: env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Correlation ID middleware
  app.use((req: any, res: any, next: any) => {
    const correlationId = getOrGenerateCorrelationId(req.headers[CORRELATION_HEADER]);
    req.correlationId = correlationId;
    res.setHeader(CORRELATION_HEADER, correlationId);
    next();
  });

  // Global Rate Limiter
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi beberapa saat.',
      },
      timestamp: new Date().toISOString(),
    },
  });
  app.use('/api/', limiter);

  // Stricter rate limit on sensitive auth routes (login, register)
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 attempts per minute
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_AUTH_ATTEMPTS',
        message: 'Batas percobaan login/registrasi terlampaui. Tunggu 1 menit.',
      },
      timestamp: new Date().toISOString(),
    },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Setup Upstream Microservice Proxies
  const proxyService = app.get(ProxyService);
  const newsProxy = proxyService.createNewsProxy();
  const aiProxy = proxyService.createAiProxy();
  const ingestorProxy = proxyService.createIngestorProxy();
  const communityProxy = proxyService.createCommunityProxy();
  const eventProxy = proxyService.createEventProxy();
  const mediaProxy = proxyService.createMediaProxy();
  const bracketProxy = proxyService.createBracketProxy();
  const identityProxy = proxyService.createIdentityProxy();

  // News routes
  app.use('/api/news', newsProxy);
  app.use('/api/admin/news', newsProxy);

  // Community & Moderation routes
  app.use('/api/communities', communityProxy);
  app.use('/api/admin/moderation', communityProxy);

  // Event & EO Tools routes
  app.use('/api/events', eventProxy);
  app.use('/api/eo', eventProxy);

  // Media & Event Storage routes
  app.use('/api/media', mediaProxy);

  // Bracket, Leaderboard & Realtime SSE routes
  app.use('/api/brackets', bracketProxy);

  // AI engine routes
  app.use('/api/ai', aiProxy);

  // Ingestor pipeline routes
  app.use('/api/ingest', ingestorProxy);

  // Identity / Auth routes (and fallback)
  app.use('/api', identityProxy);

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ESPORT SUMBAR - API Gateway')
    .setDescription('Unified API Gateway routing to ESPORT SUMBAR microservices')
    .setVersion(env.SERVICE_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  await app.listen(env.PORT);
  logger.info(`API Gateway running on port ${env.PORT}`, 'Bootstrap', {
    gatewayUrl: `http://localhost:${env.PORT}`,
    swaggerUrl: `http://localhost:${env.PORT}/docs`,
    healthUrl: `http://localhost:${env.PORT}/health`,
    identityUpstream: env.IDENTITY_SERVICE_URL,
  });
}

bootstrap().catch((err: Error) => {
  const logger = new StructuredLogger('bootstrap');
  logger.error('Failed to start API Gateway', err);
  process.exit(1);
});
