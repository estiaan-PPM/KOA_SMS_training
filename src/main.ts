import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ExceptionsLoggerFilter } from './common/filters/exceptions-logger.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: true, // Configure appropriately for production
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new ExceptionsLoggerFilter());

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Starter API')
    .setDescription('A comprehensive NestJS starter API with authentication and best practices')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('Authentication')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();