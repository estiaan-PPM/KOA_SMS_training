import { IsEmail, IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@koaacademy.edu.za' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  schoolId?: number;
}