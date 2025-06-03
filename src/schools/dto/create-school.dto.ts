// src/schools/dto/create-school.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Koa Academy Main Campus' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  schoolName: string;

  @ApiProperty({ example: 'KOAMAIN' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  schoolCode: string;

  @ApiProperty({ example: '123 Education St, Cape Town', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+27 21 555 1234', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'admin@koa.edu.za', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ example: 'https://www.koaacademy.edu.za', required: false })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiProperty({ example: 'https://cdn.koaacademy.edu.za/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  logoUrl?: string;

  @ApiProperty({ example: 'Africa/Johannesburg', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timeZone?: string;

  @ApiProperty({ example: 'YYYY-MM-DD', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dateFormat?: string;
}
