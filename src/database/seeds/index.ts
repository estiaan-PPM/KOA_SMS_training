// src/database/seeds/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DatabaseService } from '../database.service';
import * as schema from '../schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const databaseService = app.get(DatabaseService);

  try {
    console.log('🌱 Starting database seeding...');

    // Seed Schools
    console.log('📚 Seeding schools...');
    const [koaMain, koaNorth] = await databaseService.db
      .insert(schema.schools)
      .values([
        {
          schoolName: 'Koa Academy Main Campus',
          schoolCode: 'KOAMAIN',
          address: '123 Education Street, Cape Town, 8001',
          phone: '+27 21 555 1234',
          email: 'admin@koa.edu.za',
          website: 'https://www.koaacademy.edu.za',
          timeZone: 'Africa/Johannesburg',
          dateFormat: 'YYYY-MM-DD',
        },
        {
          schoolName: 'Koa Academy North Campus',
          schoolCode: 'KOANORTH',
          address: '45 Learning Avenue, Johannesburg, 2001',
          phone: '+27 11 555 6789',
          email: 'admin.north@koa.edu.za',
          website: 'https://north.koaacademy.edu.za',
          timeZone: 'Africa/Johannesburg',
          dateFormat: 'YYYY-MM-DD',
        },
      ])
      .returning();

    // Seed Academic Years
    console.log('📅 Seeding academic years...');
    const [academicYear] = await databaseService.db
      .insert(schema.academicYears)
      .values({
        schoolId: koaMain.schoolId,
        yearName: '2025',
        startDate: '2025-01-15',
        endDate: '2025-12-15',
      })
      .returning();

    // Seed Terms
    console.log('📆 Seeding terms...');
    const terms = await databaseService.db
      .insert(schema.terms)
      .values([
        {
          academicYearId: academicYear.academicYearId,
          termName: 'Term 1',
          termNumber: 1,
          startDate: '2025-01-15',
          endDate: '2025-03-31',
          yearWeighting: 0.30,
        },
        {
          academicYearId: academicYear.academicYearId,
          termName: 'Term 2',
          termNumber: 2,
          startDate: '2025-04-15',
          endDate: '2025-06-30',
          yearWeighting: 0.30,
        },
        {
          academicYearId: academicYear.academicYearId,
          termName: 'Term 3',
          termNumber: 3,
          startDate: '2025-07-15',
          endDate: '2025-09-30',
          yearWeighting: 0.40,
        },
      ])
      .returning();

    // Seed Grade Levels
    console.log('🎓 Seeding grade levels...');
    const gradeLevels = await databaseService.db
      .insert(schema.gradeLevels)
      .values([
        { schoolId: koaMain.schoolId, gradeNumber: 1, description: 'Grade 1', educationalPhase: 'Intersen' },
        { schoolId: koaMain.schoolId, gradeNumber: 2, description: 'Grade 2', educationalPhase: 'Intersen' },
        { schoolId: koaMain.schoolId, gradeNumber: 3, description: 'Grade 3', educationalPhase: 'Intersen' },
        { schoolId: koaMain.schoolId, gradeNumber: 4, description: 'Grade 4', educationalPhase: 'Intersen' },
        { schoolId: koaMain.schoolId, gradeNumber: 5, description: 'Grade 5', educationalPhase: 'Intersen' },
        { schoolId: koaMain.schoolId, gradeNumber: 6, description: 'Grade 6', educationalPhase: 'Intersen' },
        { schoolId: koaMain.schoolId, gradeNumber: 7, description: 'Grade 7', educationalPhase: 'Intersen' },
        { schoolId: koaMain.schoolId, gradeNumber: 8, description: 'Grade 8', educationalPhase: 'FET' },
        { schoolId: koaMain.schoolId, gradeNumber: 9, description: 'Grade 9', educationalPhase: 'FET' },
        { schoolId: koaMain.schoolId, gradeNumber: 10, description: 'Grade 10', educationalPhase: 'FET' },
        { schoolId: koaMain.schoolId, gradeNumber: 11, description: 'Grade 11', educationalPhase: 'FET' },
        { schoolId: koaMain.schoolId, gradeNumber: 12, description: 'Grade 12', educationalPhase: 'FET' },
      ])
      .returning();

    // Seed Teachers
    console.log('👨‍🏫 Seeding teachers...');
    const teachers = await databaseService.db
      .insert(schema.teachers)
      .values([
        {
          schoolId: koaMain.schoolId,
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@koa.edu.za',
          phone: '+27 82 111 2222',
          hireDate: '2020-01-15',
        },
        {
          schoolId: koaMain.schoolId,
          firstName: 'Michael',
          lastName: 'Williams',
          email: 'michael.williams@koa.edu.za',
          phone: '+27 83 333 4444',
          hireDate: '2021-02-01',
        },
        {
          schoolId: koaMain.schoolId,
          firstName: 'Lerato',
          lastName: 'Mthembu',
          email: 'lerato.mthembu@koa.edu.za',
          phone: '+27 84 555 6666',
          hireDate: '2019-08-15',
        },
      ])
      .returning();

    // Seed Families and Guardians
    console.log('👨‍👩‍👧‍👦 Seeding families...');
    const families = await databaseService.db
      .insert(schema.families)
      .values([
        {
          schoolId: koaMain.schoolId,
          familyName: 'Smith Family',
          primaryContactEmail: 'parent@smith.family',
          primaryContactPhone: '+27 82 777 8888',
          primaryContactName: 'John Smith Sr.',
          address: '456 Family Lane, Cape Town, 8002',
        },
        {
          schoolId: koaMain.schoolId,
          familyName: 'Ndlovu Family',
          primaryContactEmail: 'parent@ndlovu.family',
          primaryContactPhone: '+27 83 999 0000',
          primaryContactName: 'Themba Ndlovu',
          address: '789 Community Road, Cape Town, 8003',
        },
      ])
      .returning();

    const guardians = await databaseService.db
      .insert(schema.guardians)
      .values([
        {
          schoolId: koaMain.schoolId,
          firstName: 'John',
          lastName: 'Smith Sr.',
          email: 'john.smith@example.com',
          phone: '+27 82 777 8888',
          relationshipToStudent: 'Father',
        },
        {
          schoolId: koaMain.schoolId,
          firstName: 'Mary',
          lastName: 'Smith',
          email: 'mary.smith@example.com',
          phone: '+27 82 777 8889',
          relationshipToStudent: 'Mother',
        },
        {
          schoolId: koaMain.schoolId,
          firstName: 'Themba',
          lastName: 'Ndlovu',
          email: 'themba.ndlovu@example.com',
          phone: '+27 83 999 0000',
          relationshipToStudent: 'Father',
        },
      ])
      .returning();

    // Link guardians to families
    await databaseService.db
      .insert(schema.familyGuardians)
      .values([
        {
          familyId: families[0].familyId,
          guardianId: guardians[0].guardianId,
          isPrimaryContact: true,
          hasParentalResponsibility: true,
          hasPortalAccess: true,
          receivesReports: true,
        },
        {
          familyId: families[0].familyId,
          guardianId: guardians[1].guardianId,
          isPrimaryContact: false,
          hasParentalResponsibility: true,
          hasPortalAccess: true,
          receivesReports: true,
        },
        {
          familyId: families[1].familyId,
          guardianId: guardians[2].guardianId,
          isPrimaryContact: true,
          hasParentalResponsibility: true,
          hasPortalAccess: true,
          receivesReports: true,
        },
      ]);

    // Seed Students
    console.log('🎒 Seeding students...');
    const students = await databaseService.db
      .insert(schema.students)
      .values([
        {
          schoolId: koaMain.schoolId,
          firstName: 'Emma',
          lastName: 'Smith',
          dateOfBirth: '2012-03-15',
          gender: 'Female',
          emergencyContact: 'John Smith Sr.',
          emergencyPhone: '+27 82 777 8888',
          currentGradeLevel: gradeLevels[5].gradeLevelId, // Grade 6
          enrollmentDate: '2023-01-15',
        },
        {
          schoolId: koaMain.schoolId,
          firstName: 'Sipho',
          lastName: 'Ndlovu',
          dateOfBirth: '2013-07-22',
          gender: 'Male',
          emergencyContact: 'Themba Ndlovu',
          emergencyPhone: '+27 83 999 0000',
          currentGradeLevel: gradeLevels[4].gradeLevelId, // Grade 5
          enrollmentDate: '2023-01-15',
        },
        {
          schoolId: koaMain.schoolId,
          firstName: 'Aisha',
          lastName: 'Patel',
          dateOfBirth: '2011-11-08',
          gender: 'Female',
          emergencyContact: 'Raj Patel',
          emergencyPhone: '+27 84 555 3333',
          currentGradeLevel: gradeLevels[6].gradeLevelId, // Grade 7
          enrollmentDate: '2022-01-10',
        },
      ])
      .returning();

    // Link students to families
    await databaseService.db
      .insert(schema.familyStudents)
      .values([
        {
          familyId: families[0].familyId,
          studentId: students[0].studentId,
          relationship: 'Child',
          isPrimaryFamily: true,
        },
        {
          familyId: families[1].familyId,
          studentId: students[1].studentId,
          relationship: 'Child',
          isPrimaryFamily: true,
        },
      ]);

    // Seed Admin Users
    console.log('👤 Seeding admin users...');
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const teacherPassword = await bcrypt.hash('Teacher123!', 12);

    await databaseService.db
      .insert(schema.userAccounts)
      .values([
        {
          schoolId: koaMain.schoolId,
          username: 'admin@koa.edu.za',
          email: 'admin@koa.edu.za',
          userType: 'Admin',
          passwordHash: adminPassword,
        },
        {
          schoolId: koaMain.schoolId,
          username: 'sarah.johnson@koa.edu.za',
          email: 'sarah.johnson@koa.edu.za',
          userType: 'Teacher',
          relatedEntityId: teachers[0].teacherId,
          passwordHash: teacherPassword,
        },
        {
          schoolId: koaMain.schoolId,
          username: 'parent@smith.family',
          email: 'parent@smith.family',
          userType: 'Parent',
          relatedEntityId: guardians[0].guardianId,
          passwordHash: await bcrypt.hash('Parent123!', 12),
        },
      ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('🔑 Default login credentials:');
    console.log('Admin: admin@koa.edu.za / Admin123!');
    console.log('Teacher: sarah.johnson@koa.edu.za / Teacher123!');
    console.log('Parent: parent@smith.family / Parent123!');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🌱 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export { seed };
