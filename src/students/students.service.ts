// src/students/students.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { eq, and, ilike, desc, asc } from 'drizzle-orm';
import * as schema from '../database/schema';
import { Student, CreateStudent, PaginatedResult, TenantContext } from '../database/types';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto';

@Injectable()
export class StudentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createStudentDto: CreateStudentDto, context: TenantContext): Promise<Student> {
    try {
      const [student] = await this.databaseService.db
        .insert(schema.students)
        .values({
          ...createStudentDto,
          schoolId: context.schoolId,
        })
        .returning();

      return student;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictException('Student with this information already exists');
      }
      throw error;
    }
  }

  async findAll(
    query: StudentQueryDto,
    context: TenantContext,
  ): Promise<PaginatedResult<Student>> {
    const { page = 1, limit = 10, search, gradeLevel, isActive } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(schema.students.schoolId, context.schoolId)];

    if (search) {
      whereConditions.push(
        ilike(schema.students.firstName, `%${search}%`),
      );
    }

    if (gradeLevel !== undefined) {
      whereConditions.push(eq(schema.students.currentGradeLevel, gradeLevel));
    }

    if (isActive !== undefined) {
      if (isActive) {
        whereConditions.push(eq(schema.students.exitDate, null));
      } else {
        // Students with exit date are considered inactive
      }
    }

    const students = await this.databaseService.db.query.students.findMany({
      where: and(...whereConditions),
      with: {
        currentGrade: true,
        familyStudents: {
          with: {
            family: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [asc(schema.students.lastName), asc(schema.students.firstName)],
    });

    // Get total count for pagination
    const [{ count }] = await this.databaseService.db
      .select({ count: schema.students.studentId })
      .from(schema.students)
      .where(and(...whereConditions));

    return {
      data: students,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async findOne(id: number, context: TenantContext): Promise<Student> {
    const student = await this.databaseService.db.query.students.findFirst({
      where: and(
        eq(schema.students.studentId, id),
        eq(schema.students.schoolId, context.schoolId),
      ),
      with: {
        currentGrade: true,
        familyStudents: {
          with: {
            family: {
              with: {
                familyGuardians: {
                  with: {
                    guardian: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
    context: TenantContext,
  ): Promise<Student> {
    const existingStudent = await this.findOne(id, context);
    
    const [updatedStudent] = await this.databaseService.db
      .update(schema.students)
      .set(updateStudentDto)
      .where(
        and(
          eq(schema.students.studentId, id),
          eq(schema.students.schoolId, context.schoolId),
        ),
      )
      .returning();

    if (!updatedStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return updatedStudent;
  }

  async remove(id: number, context: TenantContext): Promise<void> {
    const student = await this.findOne(id, context);
    
    // Soft delete by setting exit date
    await this.databaseService.db
      .update(schema.students)
      .set({
        exitDate: new Date().toISOString().split('T')[0],
        exitReason: 'Removed by administrator',
      })
      .where(
        and(
          eq(schema.students.studentId, id),
          eq(schema.students.schoolId, context.schoolId),
        ),
      );
  }

  async getStudentsByGradeLevel(
    gradeLevelId: number,
    context: TenantContext,
  ): Promise<Student[]> {
    return await this.databaseService.db.query.students.findMany({
      where: and(
        eq(schema.students.currentGradeLevel, gradeLevelId),
        eq(schema.students.schoolId, context.schoolId),
        eq(schema.students.exitDate, null), // Only active students
      ),
      with: {
        currentGrade: true,
      },
      orderBy: [asc(schema.students.lastName), asc(schema.students.firstName)],
    });
  }

  async getStudentFamilyInfo(id: number, context: TenantContext) {
    const student = await this.databaseService.db.query.students.findFirst({
      where: and(
        eq(schema.students.studentId, id),
        eq(schema.students.schoolId, context.schoolId),
      ),
      with: {
        familyStudents: {
          with: {
            family: {
              with: {
                familyGuardians: {
                  with: {
                    guardian: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return {
      student: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      families: student.familyStudents.map((fs) => ({
        family: fs.family,
        relationship: fs.relationship,
        isPrimaryFamily: fs.isPrimaryFamily,
        guardians: fs.family.familyGuardians.map((fg) => ({
          guardian: fg.guardian,
          isPrimaryContact: fg.isPrimaryContact,
          hasParentalResponsibility: fg.hasParentalResponsibility,
          hasPortalAccess: fg.hasPortalAccess,
        })),
      })),
    };
  }

  async promoteStudent(
    id: number,
    newGradeLevelId: number,
    context: TenantContext,
  ): Promise<Student> {
    const student = await this.findOne(id, context);
    
    return await this.update(id, { currentGradeLevel: newGradeLevelId }, context);
  }

  async getStudentStatistics(context: TenantContext) {
    const stats = await this.databaseService.db
      .select({
        total: schema.students.studentId,
        gradeLevel: schema.students.currentGradeLevel,
      })
      .from(schema.students)
      .where(
        and(
          eq(schema.students.schoolId, context.schoolId),
          eq(schema.students.exitDate, null), // Only active students
        ),
      );

    const totalStudents = stats.length;
    const byGrade = stats.reduce((acc, student) => {
      const grade = student.gradeLevel || 0;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalStudents,
      activeStudents: totalStudents,
      byGradeLevel: byGrade,
    };
  }
}