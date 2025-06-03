// src/schools/schools.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { eq, ilike, asc } from 'drizzle-orm';
import * as schema from '../database/schema';
import { School, CreateSchool, PaginatedResult } from '../database/types';
import { CreateSchoolDto, UpdateSchoolDto, SchoolQueryDto } from './dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    try {
      const [school] = await this.databaseService.db
        .insert(schema.schools)
        .values(createSchoolDto)
        .returning();

      return school;
    } catch (error) {
      if (isDatabaseError(error) && error.code === '23505') { // Unique violation
        throw new ConflictException('School with this code already exists');
      }
      throw error;
    }
  }

  async findAll(query: SchoolQueryDto): Promise<PaginatedResult<School>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(ilike(schema.schools.schoolName, `%${search}%`));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(schema.schools.isActive, isActive));
    }

    const schools = await this.databaseService.db.query.schools.findMany({
      where: whereConditions.length > 0 ? whereConditions[0] : undefined,
      limit,
      offset,
      orderBy: [asc(schema.schools.schoolName)],
    });

    // Get total count for pagination
    const totalSchools = await this.databaseService.db.query.schools.findMany();
    const total = totalSchools.length;

    return {
      data: schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<School> {
    const school = await this.databaseService.db.query.schools.findFirst({
      where: eq(schema.schools.schoolId, id),
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }

    return school;
  }

  async findByCode(schoolCode: string): Promise<School | null> {
    const school = await this.databaseService.db.query.schools.findFirst({
      where: eq(schema.schools.schoolCode, schoolCode),
    });

    return school || null;
  }

  async update(id: number, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    await this.findOne(id); // Ensure school exists
    
    try {
      const [updatedSchool] = await this.databaseService.db
        .update(schema.schools)
        .set(updateSchoolDto)
        .where(eq(schema.schools.schoolId, id))
        .returning();

      if (!updatedSchool) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }

      return updatedSchool;
    } catch (error) {
      if (isDatabaseError(error) && error.code === '23505') { // Unique violation
        throw new ConflictException('School with this code already exists');
      }
      throw error;
    }
  }

  async deactivate(id: number): Promise<School> {
    return await this.update(id, { isActive: false });
  }

  async activate(id: number): Promise<School> {
    return await this.update(id, { isActive: true });
  }

  async getSchoolStatistics() {
    const schools = await this.databaseService.db.query.schools.findMany();
    const totalSchools = schools.length;
    const activeSchools = schools.filter(s => s.isActive).length;

    return {
      totalSchools,
      activeSchools,
      inactiveSchools: totalSchools - activeSchools,
    };
  }
}

function isDatabaseError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

