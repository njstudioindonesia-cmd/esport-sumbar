import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.config';
import { StructuredLogger } from '@esport-sumbar/utils';

async function bootstrap(): Promise<void> {
  const env = validateEnv(process.env);
  const logger = new StructuredLogger(env.SERVICE_NAME);

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors({
    origin: env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ESPORT SUMBAR - News Ingestor Worker')
    .setDescription('Worker & Pipeline Ingesti RSS, Deduplikasi & Kurasi AI Berita Esport')
    .setVersion(env.SERVICE_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  await app.listen(env.PORT);
  logger.info(`News Ingestor worker running on port ${env.PORT}`, 'Bootstrap', {
    swaggerUrl: `http://localhost:${env.PORT}/docs`,
    healthUrl: `http://localhost:${env.PORT}/health`,
  });
}

bootstrap().catch((err: Error) => {
  const logger = new StructuredLogger('bootstrap');
  logger.error('Failed to start News Ingestor worker', err);
  process.exit(1);
});
