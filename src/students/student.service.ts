// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {CreateStudentDto} from './dto/create-student.dto';
// import {Student} from './student.interface';
import {UpdateStudentDto} from './dto/update-student.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { databaseSchema } from '../database/database-schema';
import { eq } from 'drizzle-orm';

@Injectable()
export default class StudentsService {
    constructor(private readonly drizzleService: DrizzleService) {}

    getAll() {
    return this.drizzleService.db.select().from(databaseSchema.students);
  }

    async getById(id: number) {
    const students = await this.drizzleService.db
      .select()
      .from(databaseSchema.students)
      .where(eq(databaseSchema.students.id, id));
    const student = students.pop();
    if (!student) {
      throw new NotFoundException();
    }
    return student;
  }

  async create(student: CreateStudentDto) {
    const createdStudents = await this.drizzleService.db
      .insert(databaseSchema.students)
      .values(student)
      .returning();
 
    return createdStudents.pop();
  }

  async update(id: number, student: UpdateStudentDto) {
    const updatedStudents = await this.drizzleService.db
      .update(databaseSchema.students)
      .set(student)
      .where(eq(databaseSchema.students.id, id))
      .returning();
 
    if (updatedStudents.length === 0) {
      throw new NotFoundException();
    }
 
    return updatedStudents.pop();
  }

  async delete(id: number) {
    const deletedStudents = await this.drizzleService.db
      .delete(databaseSchema.students)
      .where(eq(databaseSchema.students.id, id))
      .returning();
 
    if (deletedStudents.length === 0) {
      throw new NotFoundException();
    }
  }
}