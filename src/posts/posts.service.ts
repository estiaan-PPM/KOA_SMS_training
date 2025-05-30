import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';

import { DrizzleService } from '../database/drizzle.service';
import { posts } from '../database/schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAllPosts() {
    return this.drizzleService.db.query.posts.findMany({
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where: eq(posts.published, true),
    });
  }

  async getPostById(id: number) {
    const post = await this.drizzleService.db.query.posts.findFirst({
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where: and(eq(posts.id, id), eq(posts.published, true)),
    });

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return post;
  }

  async createPost(post: CreatePostDto, authorId: number) {
    const result = await this.drizzleService.db
      .insert(posts)
      .values({
        ...post,
        authorId,
      })
      .returning();

    return result[0];
  }

  async updatePost(id: number, postData: UpdatePostDto, authorId: number) {
    const result = await this.drizzleService.db
      .update(posts)
      .set(postData)
      .where(and(eq(posts.id, id), eq(posts.authorId, authorId)))
      .returning();

    if (result.length === 0) {
      throw new HttpException(
        'Post not found or you are not authorized to update it',
        HttpStatus.NOT_FOUND,
      );
    }

    return result[0];
  }

  async deletePost(id: number, authorId: number) {
    const result = await this.drizzleService.db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.authorId, authorId)))
      .returning();

    if (result.length === 0) {
      throw new HttpException(
        'Post not found or you are not authorized to delete it',
        HttpStatus.NOT_FOUND,
      );
    }

    return { message: 'Post deleted successfully' };
  }

  async getUserPosts(authorId: number) {
    return this.drizzleService.db.query.posts.findMany({
      where: eq(posts.authorId, authorId),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}