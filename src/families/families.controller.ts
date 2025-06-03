// src/families/families.controller.ts
import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';

@ApiTags('families')
@Controller('families')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all families' })
  @ApiResponse({ status: 200, description: 'Families retrieved successfully' })
  findAll(@CurrentTenant() context: TenantContext) {
    return this.familiesService.findAll(context);
  }

  @Get(':id')
  @Roles('Admin', 'Teacher', 'Parent')
  @ApiOperation({ summary: 'Get family by ID' })
  @ApiResponse({ status: 200, description: 'Family retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.familiesService.findOne(id, context);
  }
}

