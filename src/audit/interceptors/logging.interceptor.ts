// src/audit/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from '../audit.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const user = (request as any).user;

    const startTime = Date.now();

    // Log request
    this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip}`);

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = response.statusCode;

        this.logger.log(
          `Outgoing Response: ${method} ${url} - ${statusCode} - ${duration}ms`,
        );

        // Log to audit system for important actions
        if (this.shouldAuditAction(method, url, statusCode)) {
          this.auditAction(method, url, user, ip, userAgent, data);
        }
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.logger.error(
          `Request Error: ${method} ${url} - ${error.status || 500} - ${duration}ms`,
          error.stack,
        );

        throw error;
      }),
    );
  }

  private shouldAuditAction(method: string, url: string, statusCode: number): boolean {
    // Audit successful state-changing operations
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') && 
        statusCode >= 200 && statusCode < 300) {
      return true;
    }

    // Audit login/logout actions
    if (url.includes('/auth/')) {
      return true;
    }

    // Don't audit health checks, static files, etc.
    if (url.includes('/health') || url.includes('/static') || url.includes('/docs')) {
      return false;
    }

    return false;
  }

  private async auditAction(
    method: string,
    url: string,
    user: any,
    ipAddress: string,
    userAgent: string,
    responseData: any,
  ) {
    try {
      if (!user) return;

      const context = {
        schoolId: user.schoolId,
        userId: user.userId,
        userRole: user.userType,
      };

      let actionType = method;
      let entityType = this.extractEntityType(url);

      // Special handling for auth endpoints
      if (url.includes('/auth/login')) {
        actionType = 'LOGIN';
        entityType = 'UserAccount';
      } else if (url.includes('/auth/logout')) {
        actionType = 'LOGOUT';
        entityType = 'UserAccount';
      }

      await this.auditService.logAction(
        {
          actionType,
          entityType,
          ipAddress,
          userAgent,
          newValues: method !== 'GET' ? responseData : undefined,
        },
        context,
      );
    } catch (error) {
      this.logger.error('Failed to log audit action', error);
    }
  }

  private extractEntityType(url: string): string {
    // Extract entity type from URL path
    const pathSegments = url.split('/').filter(segment => segment && !segment.match(/^\d+$/));
    
    if (pathSegments.length > 0) {
      const entityPath = pathSegments[pathSegments.length - 1];
      // Convert plural to singular and capitalize
      return entityPath.replace(/s$/, '').replace(/^./, str => str.toUpperCase());
    }
    
    return 'Unknown';
  }
}

