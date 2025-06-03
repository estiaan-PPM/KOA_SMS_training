// src/families/families.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { eq, and } from 'drizzle-orm';
import * as schema from '../database/schema';
import { TenantContext } from '../database/types';

@Injectable()
export class FamiliesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(context: TenantContext) {
    return await this.databaseService.db.query.families.findMany({
      where: eq(schema.families.schoolId, context.schoolId),
      with: {
        familyStudents: {
          with: {
            student: true,
          },
        },
        familyGuardians: {
          with: {
            guardian: true,
          },
        },
      },
    });
  }

  async findOne(id: number, context: TenantContext) {
    const family = await this.databaseService.db.query.families.findFirst({
      where: and(
        eq(schema.families.familyId, id),
        eq(schema.families.schoolId, context.schoolId),
      ),
      with: {
        familyStudents: {
          with: {
            student: true,
          },
        },
        familyGuardians: {
          with: {
            guardian: true,
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }

    return family;
  }
}

