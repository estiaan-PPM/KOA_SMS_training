// src/students/dto/update-student.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsOptional, IsDateString, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  exitDate?: string;

  @ApiProperty({ example: 'Relocated', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  exitReason?: string;
}

