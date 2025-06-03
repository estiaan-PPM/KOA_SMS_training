// src/teachers/teachers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherQueryDto } from './dto/teacher-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@ApiTags('teachers')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new teacher' })
  @ApiResponse({ status: 201, description: 'Teacher successfully created' })
  @ApiResponse({ status: 409, description: 'Teacher already exists' })
  create(
    @Body() createTeacherDto: CreateTeacherDto,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.teachersService.create(createTeacherDto, context);
  }

  @Get()
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all teachers with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Teachers retrieved successfully' })
  findAll(
    @Query() query: TeacherQueryDto,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.teachersService.findAll(query, context);
  }

  @Get('statistics')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get teacher statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@CurrentTenant() context: TenantContext) {
    return this.teachersService.getTeacherStatistics(context);
  }

  @Get(':id')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get teacher by ID' })
  @ApiResponse({ status: 200, description: 'Teacher retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.teachersService.findOne(id, context);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update teacher information' })
  @ApiResponse({ status: 200, description: 'Teacher updated successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.teachersService.update(id, updateTeacherDto, context);
  }

  @Patch(':id/deactivate')
  @Roles('Admin')
  @ApiOperation({ summary: 'Deactivate teacher' })
  @ApiResponse({ status: 200, description: 'Teacher deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.teachersService.deactivate(id, context);
  }

  @Patch(':id/activate')
  @Roles('Admin')
  @ApiOperation({ summary: 'Activate teacher' })
  @ApiResponse({ status: 200, description: 'Teacher activated successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  activate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.teachersService.activate(id, context);
  }
}