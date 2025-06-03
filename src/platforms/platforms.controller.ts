// src/platforms/platforms.controller.ts
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformsService } from './platforms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';

@ApiTags('platforms')
@Controller('platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Get('overview')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get platforms overview' })
  @ApiResponse({ status: 200, description: 'Platforms overview retrieved successfully' })
  getOverview(@CurrentTenant() context: TenantContext) {
    return this.platformsService.getPlatformOverview(context);
  }
}