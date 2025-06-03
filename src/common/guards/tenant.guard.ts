// src/common/guards/tenant.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.schoolId) {
      throw new ForbiddenException('Access denied: No tenant context');
    }

    // Add tenant context to request for easy access
    request.tenant = {
      schoolId: user.schoolId,
      userId: user.userId,
      userType: user.userType,
    };

    return true;
  }
}

