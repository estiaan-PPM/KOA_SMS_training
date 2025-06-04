
import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import StudentsService from './student.service';
import {CreateStudentDto} from './dto/create-student.dto';
import {UpdateStudentDto} from './dto/update-student.dto';


@Controller('students')
export default class StudentController {
    constructor(
        private readonly studentsService: StudentsService
){}

@Get()
getAllStudents(){
    return this.studentsService.getAllStudents();
}

@Get(':id')
getStudentById(@Param('id') id:string) {
    return this.studentsService.getStudentById(Number(id));
}

@Post()
async createStudent(@Body() student: CreateStudentDto) {
    return this.studentsService.createStudent(student);
}

@Put(':id')
async replaceStudent(@Param('id') id: string, @Body() student: UpdateStudentDto) {
    return this.studentsService.replaceStudent(Number(id), student);
}

@Delete(':id')
async deleteStudent(@Param('id') id:string) {
    this.studentsService.deleteStudent(Number(id));
}


}
