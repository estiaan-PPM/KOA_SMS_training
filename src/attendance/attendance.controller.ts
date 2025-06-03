// src/attendance/attendance.controller.ts
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('overview')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get attendance overview' })
  @ApiResponse({ status: 200, description: 'Attendance overview retrieved successfully' })
  getOverview(@CurrentTenant() context: TenantContext) {
    return this.attendanceService.getAttendanceOverview(context);
  }
}

