
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import StudentsService from './student.service';
import {CreateStudentDto} from './dto/create-student.dto';
import {UpdateStudentDto} from './dto/update-Student.dto';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
 
@Controller('students')
export default class StudentsController {
  constructor(
    private readonly studentsService: StudentsService
  ) {}
 
  @Get()
  getAll() {
    return this.studentsService.getAll();
  }
 
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getById(id);
  }
 
  @Post()
  @UseGuards(JwtAuthenticationGuard)
  create(@Body() student: CreateStudentDto) {
    return this.studentsService.create(student);
  }
 
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() student: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, student);
  }
 
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.studentsService.delete(id);
  }
}