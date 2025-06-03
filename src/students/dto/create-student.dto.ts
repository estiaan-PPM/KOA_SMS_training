// src/students/dto/create-student.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '2010-05-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  emergencyContact: string;

  @ApiProperty({ example: '+27 82 555 1234' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  emergencyPhone: string;

  @ApiProperty({ example: 'No known allergies', required: false })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  currentGradeLevel: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  enrollmentDate: string;
}

