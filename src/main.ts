import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './shared/services/logger.service';

async function bootstrap() {
  // Create Fastify-based NestJS application
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Get config service for environment variables
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Custom logger
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Enable CORS
  app.enableCors();

  // Start the application
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
