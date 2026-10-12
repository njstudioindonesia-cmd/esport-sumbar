import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.config';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalHttpExceptionFilter(env.SERVICE_NAME));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ESPORT SUMBAR - Identity Service')
    .setDescription('Autentikasi, JWT Refresh Rotation, RBAC, Profil, dan Verifikasi EO')
    .setVersion(env.SERVICE_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.enableShutdownHooks();

  await app.listen(env.PORT);
  logger.info(`Identity service running on port ${env.PORT}`, 'Bootstrap', {
    swaggerUrl: `http://localhost:${env.PORT}/docs`,
    healthUrl: `http://localhost:${env.PORT}/health`,
  });
}

bootstrap().catch((err: Error) => {
  const logger = new StructuredLogger('bootstrap');
  logger.error('Failed to start identity service', err);
  process.exit(1);
});
