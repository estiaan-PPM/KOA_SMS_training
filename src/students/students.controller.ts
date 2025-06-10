import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import StudentsService from './student.service';
import {CreateStudentDto} from './dto/create-student.dto';
import {UpdateStudentDto} from './dto/update-Student.dto';
 
@Controller('api/students')
export default class StudentsController {
  constructor(
    private readonly studentsService: StudentsService
  ) {}
 
  @Get()
  getAllStudents() {
    return this.studentsService.getAllStudents();
  }

  @Get('search')
  searchStudents(
    @Query('id') id?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('status') status?: string,
    @Query('email') email?: string,
  ) {
    return this.studentsService.searchStudents({
      id: id ? Number(id) : undefined,
      firstName,
      lastName,
      status,
      email,
    });
  }
 
  @Get(':id')
  getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentById(Number(id));
  }
 
  @Post()
  async createStudent(@Body() Student: CreateStudentDto) {
    return this.studentsService.createStudent(Student);
  }
 
  @Put(':id')
  async replaceStudent(@Param('id') id: string, @Body() Student: UpdateStudentDto) {
    return this.studentsService.replaceStudent(Number(id), Student);
  }
 
  @Delete(':id')
  async deleteStudent(@Param('id') id: string) {
    this.studentsService.deleteStudent(Number(id));
  }
}