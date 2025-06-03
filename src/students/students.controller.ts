// src/students/students.controller.ts
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
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';
import { TenantContext } from '../database/types';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'Student successfully created' })
  @ApiResponse({ status: 409, description: 'Student already exists' })
  create(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.create(createStudentDto, context);
  }

  @Get()
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get all students with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  findAll(
    @Query() query: StudentQueryDto,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.findAll(query, context);
  }

  @Get('statistics')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get student statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@CurrentTenant() context: TenantContext) {
    return this.studentsService.getStudentStatistics(context);
  }

  @Get('grade/:gradeLevelId')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Get students by grade level' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  getByGradeLevel(
    @Param('gradeLevelId', ParseIntPipe) gradeLevelId: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.getStudentsByGradeLevel(gradeLevelId, context);
  }

  @Get(':id')
  @Roles('Admin', 'Teacher', 'Parent')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.findOne(id, context);
  }

  @Get(':id/family')
  @Roles('Admin', 'Teacher', 'Parent')
  @ApiOperation({ summary: 'Get student family information' })
  @ApiResponse({ status: 200, description: 'Family information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  getStudentFamily(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.getStudentFamilyInfo(id, context);
  }

  @Patch(':id')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Update student information' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.update(id, updateStudentDto, context);
  }

  @Patch(':id/promote/:gradeLevelId')
  @Roles('Admin', 'Teacher')
  @ApiOperation({ summary: 'Promote student to new grade level' })
  @ApiResponse({ status: 200, description: 'Student promoted successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  promoteStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('gradeLevelId', ParseIntPipe) gradeLevelId: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.promoteStudent(id, gradeLevelId, context);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Remove student (soft delete)' })
  @ApiResponse({ status: 200, description: 'Student removed successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenant() context: TenantContext,
  ) {
    return this.studentsService.remove(id, context);
  }
}

