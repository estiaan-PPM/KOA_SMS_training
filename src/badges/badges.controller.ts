// src/badges/badges.controller.ts
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';

@ApiTags('badges')
@Controller('badges')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get('overview')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get badges overview' })
  @ApiResponse({ status: 200, description: 'Badges overview retrieved successfully' })
  getOverview(@CurrentTenant() context: TenantContext) {
    return this.badgesService.getBadgeOverview(context);
  }
}