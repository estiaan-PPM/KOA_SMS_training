import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {CreateStudentDto} from './dto/create-student.dto';
import {Student} from './student.interface';
import {UpdateStudentDto} from './dto/update-student.dto';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export default class StudentsService {
    constructor(private readonly eventBus: EventBus) {}

    private lastStudentId = 0;
    private students: Student[] = [];

    getAllStudents() {
        return this.students;
    }

    getStudentById(id: number) {
        const student = this.students.find(student => student.id === id);
        if(student) {
            return student;
        }
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
    }

    replaceStudent(id: number, student: UpdateStudentDto) {
        const studentIndex = this.students.findIndex(student => student.id === id);
        if (studentIndex > -1) {
            this.students[studentIndex] = { 
                ...this.students[studentIndex], 
                ...student,
                id // This ensures ID from URL parameter is always used
            };
            return this.students[studentIndex];
        }
        throw new HttpException('student not found', HttpStatus.NOT_FOUND);
    }
    
    createStudent(student: CreateStudentDto) {
        const newStudent = {
        id: ++this.lastStudentId,
        ...student
        };
        this.students.push(newStudent);

        this.eventBus.publish(
            new StudentCreatedEvent(
                newStudent.id.toString(),
                newStudent.email,
                newStudent.firstName
            )
        );

        return newStudent;
    }
    
    deleteStudent(id: number) {
        const studentIndex = this.students.findIndex(student => student.id === id);
        if (studentIndex > -1) {
        this.students.splice(studentIndex, 1);
        } else {
        throw new HttpException('student not found', HttpStatus.NOT_FOUND);
        }
    }
}