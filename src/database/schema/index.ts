// src/database/schema/index.ts
import { relations } from 'drizzle-orm';
import { 
  serial, 
  text, 
  integer, 
  boolean, 
  decimal, 
  timestamp, 
  date,
  pgTable,
  pgEnum,
  json,
  uuid,
  varchar,
  primaryKey,
  index,
  unique
} from 'drizzle-orm/pg-core';

// Enums
export const educationalPhaseEnum = pgEnum('educational_phase', ['Intersen', 'FET']);
export const userTypeEnum = pgEnum('user_type', ['Student', 'Teacher', 'Parent', 'Admin']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['Present', 'Absent', 'Late', 'Excused']);
export const gradeStatusEnum = pgEnum('grade_status', ['COMPLETE', 'PENDING', 'ACTIVE', 'NOT_STARTED']);

// Schools table
export const schools = pgTable('schools', {
  schoolId: serial('school_id').primaryKey(),
  schoolName: varchar('school_name', { length: 100 }).notNull(),
  schoolCode: varchar('school_code', { length: 20 }).unique().notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  website: varchar('website', { length: 255 }),
  logoUrl: varchar('logo_url', { length: 255 }),
  timeZone: varchar('time_zone', { length: 50 }).default('Africa/Johannesburg'),
  dateFormat: varchar('date_format', { length: 20 }).default('YYYY-MM-DD'),
  creationDate: date('creation_date').defaultNow(),
  isActive: boolean('is_active').default(true),
});

// User Accounts
export const userAccounts = pgTable('user_accounts', {
  userId: serial('user_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  googleSsoId: varchar('google_sso_id', { length: 255 }),
  email: varchar('email', { length: 100 }).unique().notNull(),
  userType: userTypeEnum('user_type').notNull(),
  relatedEntityId: integer('related_entity_id'),
  passwordHash: text('password_hash'),
  lastLoginDate: timestamp('last_login_date'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  accountLocked: boolean('account_locked').default(false),
  passwordResetRequired: boolean('password_reset_required').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  refreshTokenHash: text('refresh_token_hash'),
  creationDate: timestamp('creation_date').defaultNow(),
  createdByUserId: integer('created_by_user_id'),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  schoolIdIdx: index('user_accounts_school_id_idx').on(table.schoolId),
  userTypeIdx: index('user_accounts_user_type_idx').on(table.userType),
}));

// Academic Years
export const academicYears = pgTable('academic_years', {
  academicYearId: serial('academic_year_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  yearName: varchar('year_name', { length: 20 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
}, (table) => ({
  schoolIdIdx: index('academic_years_school_id_idx').on(table.schoolId),
}));

// Terms
export const terms = pgTable('terms', {
  termId: serial('term_id').primaryKey(),
  academicYearId: integer('academic_year_id').references(() => academicYears.academicYearId).notNull(),
  termName: varchar('term_name', { length: 50 }).notNull(),
  termNumber: integer('term_number').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  yearWeighting: decimal('year_weighting', { precision: 5, scale: 2 }).notNull(),
}, (table) => ({
  academicYearIdIdx: index('terms_academic_year_id_idx').on(table.academicYearId),
}));

// Sprints
export const sprints = pgTable('sprints', {
  sprintId: serial('sprint_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  termId: integer('term_id').references(() => terms.termId).notNull(),
  sprintName: varchar('sprint_name', { length: 100 }).notNull(),
  sprintNumber: integer('sprint_number').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
}, (table) => ({
  schoolIdIdx: index('sprints_school_id_idx').on(table.schoolId),
  termIdIdx: index('sprints_term_id_idx').on(table.termId),
}));

// Grade Levels
export const gradeLevels = pgTable('grade_levels', {
  gradeLevelId: serial('grade_level_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  gradeNumber: integer('grade_number').notNull(),
  description: varchar('description', { length: 100 }),
  educationalPhase: educationalPhaseEnum('educational_phase').notNull(),
}, (table) => ({
  schoolIdIdx: index('grade_levels_school_id_idx').on(table.schoolId),
}));

// Teachers
export const teachers = pgTable('teachers', {
  teacherId: serial('teacher_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }),
  hireDate: date('hire_date').notNull(),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  schoolIdIdx: index('teachers_school_id_idx').on(table.schoolId),
  emailIdx: index('teachers_email_idx').on(table.email),
}));

// Students
export const students = pgTable('students', {
  studentId: serial('student_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: varchar('gender', { length: 20 }),
  emergencyContact: varchar('emergency_contact', { length: 100 }),
  emergencyPhone: varchar('emergency_phone', { length: 20 }),
  medicalNotes: text('medical_notes'),
  currentGradeLevel: integer('current_grade_level').references(() => gradeLevels.gradeLevelId),
  enrollmentDate: date('enrollment_date').notNull(),
  exitDate: date('exit_date'),
  exitReason: varchar('exit_reason', { length: 100 }),
}, (table) => ({
  schoolIdIdx: index('students_school_id_idx').on(table.schoolId),
  currentGradeLevelIdx: index('students_current_grade_level_idx').on(table.currentGradeLevel),
  nameIdx: index('students_name_idx').on(table.lastName, table.firstName),
}));

// Families
export const families = pgTable('families', {
  familyId: serial('family_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  familyName: varchar('family_name', { length: 100 }).notNull(),
  primaryContactEmail: varchar('primary_contact_email', { length: 100 }),
  primaryContactPhone: varchar('primary_contact_phone', { length: 20 }),
  primaryContactName: varchar('primary_contact_name', { length: 100 }),
  address: text('address'),
  postalAddress: text('postal_address'),
  creationDate: date('creation_date').defaultNow(),
  notes: text('notes'),
}, (table) => ({
  schoolIdIdx: index('families_school_id_idx').on(table.schoolId),
}));

// Guardians
export const guardians = pgTable('guardians', {
  guardianId: serial('guardian_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId).notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  alternativePhone: varchar('alternative_phone', { length: 20 }),
  occupation: varchar('occupation', { length: 100 }),
  employer: varchar('employer', { length: 100 }),
  relationshipToStudent: varchar('relationship_to_student', { length: 50 }).notNull(),
  creationDate: date('creation_date').defaultNow(),
  notes: text('notes'),
}, (table) => ({
  schoolIdIdx: index('guardians_school_id_idx').on(table.schoolId),
}));

// Family Students relationship
export const familyStudents = pgTable('family_students', {
  familyStudentId: serial('family_student_id').primaryKey(),
  familyId: integer('family_id').references(() => families.familyId).notNull(),
  studentId: integer('student_id').references(() => students.studentId).notNull(),
  relationship: varchar('relationship', { length: 50 }).notNull(),
  isPrimaryFamily: boolean('is_primary_family').default(true),
  joinDate: date('join_date').defaultNow(),
  leaveDate: date('leave_date'),
  notes: text('notes'),
}, (table) => ({
  familyIdIdx: index('family_students_family_id_idx').on(table.familyId),
  studentIdIdx: index('family_students_student_id_idx').on(table.studentId),
}));

// Family Guardians relationship
export const familyGuardians = pgTable('family_guardians', {
  familyGuardianId: serial('family_guardian_id').primaryKey(),
  familyId: integer('family_id').references(() => families.familyId).notNull(),
  guardianId: integer('guardian_id').references(() => guardians.guardianId).notNull(),
  isPrimaryContact: boolean('is_primary_contact').default(false),
  hasParentalResponsibility: boolean('has_parental_responsibility').default(false),
  livesWithChildren: boolean('lives_with_children').default(false),
  hasPortalAccess: boolean('has_portal_access').default(true),
  receivesReports: boolean('receives_reports').default(true),
  receivesBilling: boolean('receives_billing').default(false),
  receivesGeneralCommunication: boolean('receives_general_communication').default(true),
  joinDate: date('join_date').defaultNow(),
  leaveDate: date('leave_date'),
  notes: text('notes'),
}, (table) => ({
  familyIdIdx: index('family_guardians_family_id_idx').on(table.familyId),
  guardianIdIdx: index('family_guardians_guardian_id_idx').on(table.guardianId),
}));

// System Audit Log
export const systemAuditLog = pgTable('system_audit_log', {
  auditId: serial('audit_id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.schoolId),
  userId: integer('user_id').references(() => userAccounts.userId),
  userRole: varchar('user_role', { length: 50 }),
  actionType: varchar('action_type', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id'),
  oldValues: json('old_values'),
  newValues: json('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 255 }),
  timestamp: timestamp('timestamp').defaultNow(),
}, (table) => ({
  schoolIdIdx: index('audit_school_id_idx').on(table.schoolId),
  userIdIdx: index('audit_user_id_idx').on(table.userId),
  timestampIdx: index('audit_timestamp_idx').on(table.timestamp),
  entityIdx: index('audit_entity_idx').on(table.entityType, table.entityId),
}));

// Relations
export const schoolsRelations = relations(schools, ({ many }) => ({
  userAccounts: many(userAccounts),
  academicYears: many(academicYears),
  students: many(students),
  teachers: many(teachers),
  families: many(families),
  guardians: many(guardians),
}));

export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  school: one(schools, {
    fields: [userAccounts.schoolId],
    references: [schools.schoolId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.schoolId],
  }),
  currentGrade: one(gradeLevels, {
    fields: [students.currentGradeLevel],
    references: [gradeLevels.gradeLevelId],
  }),
  familyStudents: many(familyStudents),
}));

export const familiesRelations = relations(families, ({ one, many }) => ({
  school: one(schools, {
    fields: [families.schoolId],
    references: [schools.schoolId],
  }),
  familyStudents: many(familyStudents),
  familyGuardians: many(familyGuardians),
}));

export const guardiansRelations = relations(guardians, ({ one, many }) => ({
  school: one(schools, {
    fields: [guardians.schoolId],
    references: [schools.schoolId],
  }),
  familyGuardians: many(familyGuardians),
}));

export const familyStudentsRelations = relations(familyStudents, ({ one }) => ({
  family: one(families, {
    fields: [familyStudents.familyId],
    references: [families.familyId],
  }),
  student: one(students, {
    fields: [familyStudents.studentId],
    references: [students.studentId],
  }),
}));

export const familyGuardiansRelations = relations(familyGuardians, ({ one }) => ({
  family: one(families, {
    fields: [familyGuardians.familyId],
    references: [families.familyId],
  }),
  guardian: one(guardians, {
    fields: [familyGuardians.guardianId],
    references: [guardians.guardianId],
  }),
}));

// Export all tables
export const databaseSchema = {
  schools,
  userAccounts,
  academicYears,
  terms,
  sprints,
  gradeLevels,
  teachers,
  students,
  families,
  guardians,
  familyStudents,
  familyGuardians,
  systemAuditLog,
};