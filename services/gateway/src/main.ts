import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.config';
import { ProxyService } from './proxy/proxy.service';
import { createPortalGuardMiddleware } from './middleware/portal-guard.middleware';
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

  // Portal Isolation & Audience Guard Middleware
  app.use(createPortalGuardMiddleware(env.JWT_ACCESS_SECRET));

  // Setup Upstream Microservice Proxies
  const proxyService = app.get(ProxyService);
  const newsProxy = proxyService.createNewsProxy();
  const aiProxy = proxyService.createAiProxy();
  const ingestorProxy = proxyService.createIngestorProxy();
  const communityProxy = proxyService.createCommunityProxy();
  const eventProxy = proxyService.createEventProxy();
  const mediaProxy = proxyService.createMediaProxy();
  const bracketProxy = proxyService.createBracketProxy();
  const notificationProxy = proxyService.createNotificationProxy();
  const identityProxy = proxyService.createIdentityProxy();

  // === 1. Dedicated Public Portal Routes (/api/public/*) ===
  app.use('/api/public/news', newsProxy);
  app.use('/api/public/events', eventProxy);
  app.use('/api/public/communities', communityProxy);
  app.use('/api/public/brackets', bracketProxy);
  app.use('/api/public/media', mediaProxy);
  app.use('/api/public/search', aiProxy);
  app.use('/api/public/ai', aiProxy);
  app.use('/api/public/notifications', notificationProxy);
  app.use('/api/public', identityProxy);

  // === 2. Dedicated EO Studio Routes (/api/eo/*) ===
  app.use('/api/eo/events', eventProxy);
  app.use('/api/eo/brackets', bracketProxy);
  app.use('/api/eo/media', mediaProxy);
  app.use('/api/eo', eventProxy);

  // === 3. Dedicated Admin Console Routes (/api/admin/*) ===
  app.use('/api/admin/instagram', ingestorProxy);
  app.use('/api/admin/news', newsProxy);
  app.use('/api/admin/moderation', communityProxy);
  app.use('/api/admin/eo', identityProxy);
  app.use('/api/admin/audit', identityProxy);
  app.use('/api/admin', identityProxy);

  // === 4. Legacy /api Routes for Backward Compatibility ===
  app.use('/api/instagram', ingestorProxy);
  app.use('/api/news', newsProxy);
  app.use('/api/communities', communityProxy);
  app.use('/api/events', eventProxy);
  app.use('/api/media', mediaProxy);
  app.use('/api/brackets', bracketProxy);
  app.use('/api/notifications', notificationProxy);
  app.use('/api/search', aiProxy);
  app.use('/api/ai', aiProxy);
  app.use('/api/ingest', ingestorProxy);
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
