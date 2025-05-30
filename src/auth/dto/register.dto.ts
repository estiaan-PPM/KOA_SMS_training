import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User password (minimum 7 characters)',
    example: 'password123',
    minLength: 7,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}