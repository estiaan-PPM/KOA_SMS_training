// import { IsEnum } from 'class-validator';
import { IsString, isString } from 'class-validator';
export class CreateStudentDto {
    // StudentID: Number;
    // SchoolID: Number;
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    dateOfBirth: string;

    // @IsEnum(['Male', 'Female', 'Other'])
    // gender?:string;

    // EmergencyContact:;
    // EmergencyPhone:;
    // MedicalNotes:;
    // CurrentGradeLevel:;
    // EnrollmentDate:;
    // ExitDate:;
    // ExitReason:;

}