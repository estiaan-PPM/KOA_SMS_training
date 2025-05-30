import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthenticationGuard } from '../auth/guards/jwt-authentication.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@ApiTags('Posts')
@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createPost(@Body() post: CreatePostDto, @Req() req: RequestWithUser) {
    return this.postsService.createPost(post, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found or unauthorized' })
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() post: UpdatePostDto,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.updatePost(id, post, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found or unauthorized' })
  deletePost(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.postsService.deletePost(id, req.user.id);
  }

  @Get('user/my-posts')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user posts' })
  @ApiResponse({ status: 200, description: 'User posts retrieved successfully' })
  getUserPosts(@Req() req: RequestWithUser) {
    return this.postsService.getUserPosts(req.user.id);
  }
}