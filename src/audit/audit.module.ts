// src/audit/audit.module.ts
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Global()
@Module({
  providers: [AuditService, LoggingInterceptor],
  exports: [AuditService],
})
export class AuditModule {}