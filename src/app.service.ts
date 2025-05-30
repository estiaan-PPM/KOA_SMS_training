import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Welcome to NestJS Starter API!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}