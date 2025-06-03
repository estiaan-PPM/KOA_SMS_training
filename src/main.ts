import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS for multi-tenant setup
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Koa Academy Student Management System API')
    .setDescription(
      'Comprehensive API for managing students, teachers, assessments, and academic operations in a multi-tenant educational environment',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('Authentication')
    .addTag('authentication', 'User authentication and authorization')
    .addTag('schools', 'School management')
    .addTag('students', 'Student management')
    .addTag('teachers', 'Teacher management')
    .addTag('families', 'Family and guardian management')
    .addTag('academic', 'Academic structure and curriculum')
    .addTag('assessments', 'Assignments and marking')
    .addTag('attendance', 'Attendance tracking')
    .addTag('platforms', 'Learning platforms and targets')
    .addTag('badges', 'Achievement badges')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') ?? 3000;
  await app.listen(port);

  console.log(`🚀 Koa Academy SMS API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();