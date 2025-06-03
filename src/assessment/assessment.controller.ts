// src/assessments/assessments.controller.ts
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';

@ApiTags('assessments')
@Controller('assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('overview')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get assessment overview' })
  @ApiResponse({ status: 200, description: 'Assessment overview retrieved successfully' })
  getOverview(@CurrentTenant() context: TenantContext) {
    return this.assessmentsService.getAssessmentOverview(context);
  }
}

