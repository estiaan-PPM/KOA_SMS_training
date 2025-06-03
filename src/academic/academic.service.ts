// src/academic/academic.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { eq } from 'drizzle-orm';
import * as schema from '../database/schema';
import { TenantContext } from '../database/types';

@Injectable()
export class AcademicService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getGradeLevels(context: TenantContext) {
    return await this.databaseService.db.query.gradeLevels.findMany({
      where: eq(schema.gradeLevels.schoolId, context.schoolId),
    });
  }

  async getAcademicYears(context: TenantContext) {
    return await this.databaseService.db.query.academicYears.findMany({
      where: eq(schema.academicYears.schoolId, context.schoolId),
      with: {
        terms: true,
      },
    });
  }
}

