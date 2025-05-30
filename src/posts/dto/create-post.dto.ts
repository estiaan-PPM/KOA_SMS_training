import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'My First Post',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Post content',
    example: 'This is the content of my first post...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Whether the post is published',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
} export default CreatePostDto;