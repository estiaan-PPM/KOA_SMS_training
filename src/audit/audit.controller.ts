// src/audit/audit.controller.ts
import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../auth/guards/roles.guard';
import { Roles } from './../auth/decorators/roles.decorator';
import { CurrentTenant } from './../auth/decorators/tenant.decorator';
import { TenantContext } from './../database/types';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get audit logs with filtering' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  getAuditLogs(
    @Query() query: AuditQueryDto,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.auditService.getAuditLogs(context, query);
  }

  @Get('entity/:entityType/:entityId')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get audit history for specific entity' })
  @ApiResponse({ status: 200, description: 'Entity history retrieved successfully' })
  getEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.auditService.getEntityHistory(entityType, entityId, context);
  }

  @Get('user/:userId')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  getUserActivity(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentTenant() context: TenantContext,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.auditService.getUserActivity(userId, context, limit);
  }
}

