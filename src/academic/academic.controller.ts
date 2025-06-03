// src/academic/academic.controller.ts
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';

@ApiTags('academic')
@Controller('academic')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get('grade-levels')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all grade levels' })
  @ApiResponse({ status: 200, description: 'Grade levels retrieved successfully' })
  getGradeLevels(@CurrentTenant() context: TenantContext) {
    return this.academicService.getGradeLevels(context);
  }

  @Get('academic-years')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all academic years' })
  @ApiResponse({ status: 200, description: 'Academic years retrieved successfully' })
  getAcademicYears(@CurrentTenant() context: TenantContext) {
    return this.academicService.getAcademicYears(context);
  }
}

