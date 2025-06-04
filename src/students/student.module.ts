import { Module } from '@nestjs/common';
import StudentController from './students.controller';
import StudentsService from './student.service';

@Module({
    imports: [],
    controllers: [StudentController],
    providers: [StudentsService],
})
export class StudentsModule {}