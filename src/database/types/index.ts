// src/database/types/index.ts
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '../schema';

// User types
export type User = InferSelectModel<typeof schema.userAccounts>;
export type CreateUser = InferInsertModel<typeof schema.userAccounts>;

// School types
export type School = InferSelectModel<typeof schema.schools>;
export type CreateSchool = InferInsertModel<typeof schema.schools>;

// Student types
export type Student = InferSelectModel<typeof schema.students>;
export type CreateStudent = InferInsertModel<typeof schema.students>;

// Teacher types
export type Teacher = InferSelectModel<typeof schema.teachers>;
export type CreateTeacher = InferInsertModel<typeof schema.teachers>;

// Family types
export type Family = InferSelectModel<typeof schema.families>;
export type CreateFamily = InferInsertModel<typeof schema.families>;

export type Guardian = InferSelectModel<typeof schema.guardians>;
export type CreateGuardian = InferInsertModel<typeof schema.guardians>;

// Academic types
export type AcademicYear = InferSelectModel<typeof schema.academicYears>;
export type CreateAcademicYear = InferInsertModel<typeof schema.academicYears>;

export type Term = InferSelectModel<typeof schema.terms>;
export type CreateTerm = InferInsertModel<typeof schema.terms>;

export type GradeLevel = InferSelectModel<typeof schema.gradeLevels>;
export type CreateGradeLevel = InferInsertModel<typeof schema.gradeLevels>;

// Audit types
export type AuditLog = InferSelectModel<typeof schema.systemAuditLog>;
export type CreateAuditLog = InferInsertModel<typeof schema.systemAuditLog>;

// Common interfaces
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TenantContext {
  schoolId: number;
  userId?: number;
  userRole?: string;
}