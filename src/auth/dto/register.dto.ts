import { IsEmail, IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@koaacademy.edu.za' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'strongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Teacher', enum: ['Student', 'Teacher', 'Parent', 'Admin'] })
  @IsEnum(['Student', 'Teacher', 'Parent', 'Admin'])
  userType: 'Student' | 'Teacher' | 'Parent' | 'Admin';

  @ApiProperty({ example: 1 })
  @IsNumber()
  schoolId: number;

  @ApiProperty({ example: 123, required: false })
  @IsOptional()
  @IsNumber()
  relatedEntityId?: number;
}