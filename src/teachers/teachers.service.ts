// src/teachers/teachers.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { eq, and, ilike, asc } from 'drizzle-orm';
import * as schema from '../database/schema';
import { Teacher, CreateTeacher, PaginatedResult, TenantContext } from '../database/types';
import { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto } from './dto';

@Injectable()
export class TeachersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTeacherDto: CreateTeacherDto, context: TenantContext): Promise<Teacher> {
    try {
      const [teacher] = await this.databaseService.db
        .insert(schema.teachers)
        .values({
          ...createTeacherDto,
          schoolId: context.schoolId,
        })
        .returning();

      return teacher;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictException('Teacher with this email already exists');
      }
      throw error;
    }
  }

  async findAll(
    query: TeacherQueryDto,
    context: TenantContext,
  ): Promise<PaginatedResult<Teacher>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(schema.teachers.schoolId, context.schoolId)];

    if (search) {
      whereConditions.push(
        ilike(schema.teachers.firstName, `%${search}%`),
      );
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(schema.teachers.isActive, isActive));
    }

    const teachers = await this.databaseService.db.query.teachers.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: [asc(schema.teachers.lastName), asc(schema.teachers.firstName)],
    });

    // Get total count for pagination
    const [{ count }] = await this.databaseService.db
      .select({ count: schema.teachers.teacherId })
      .from(schema.teachers)
      .where(and(...whereConditions));

    return {
      data: teachers,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async findOne(id: number, context: TenantContext): Promise<Teacher> {
    const teacher = await this.databaseService.db.query.teachers.findFirst({
      where: and(
        eq(schema.teachers.teacherId, id),
        eq(schema.teachers.schoolId, context.schoolId),
      ),
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async findByEmail(email: string, context: TenantContext): Promise<Teacher | null> {
    const teacher = await this.databaseService.db.query.teachers.findFirst({
      where: and(
        eq(schema.teachers.email, email),
        eq(schema.teachers.schoolId, context.schoolId),
      ),
    });

    return teacher || null;
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
    context: TenantContext,
  ): Promise<Teacher> {
    const existingTeacher = await this.findOne(id, context);
    
    try {
      const [updatedTeacher] = await this.databaseService.db
        .update(schema.teachers)
        .set(updateTeacherDto)
        .where(
          and(
            eq(schema.teachers.teacherId, id),
            eq(schema.teachers.schoolId, context.schoolId),
          ),
        )
        .returning();

      if (!updatedTeacher) {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }

      return updatedTeacher;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictException('Teacher with this email already exists');
      }
      throw error;
    }
  }

  async deactivate(id: number, context: TenantContext): Promise<Teacher> {
    return await this.update(id, { isActive: false }, context);
  }

  async activate(id: number, context: TenantContext): Promise<Teacher> {
    return await this.update(id, { isActive: true }, context);
  }

  async getTeacherStatistics(context: TenantContext) {
    const stats = await this.databaseService.db
      .select({
        total: schema.teachers.teacherId,
        isActive: schema.teachers.isActive,
      })
      .from(schema.teachers)
      .where(eq(schema.teachers.schoolId, context.schoolId));

    const totalTeachers = stats.length;
    const activeTeachers = stats.filter(t => t.isActive).length;
    const inactiveTeachers = totalTeachers - activeTeachers;

    return {
      totalTeachers,
      activeTeachers,
      inactiveTeachers,
    };
  }
}

