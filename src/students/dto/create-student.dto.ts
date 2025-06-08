import { IsString, isString } from 'class-validator';
export class CreateStudentDto {

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    email: string;

    @IsString()
    status: string;

}