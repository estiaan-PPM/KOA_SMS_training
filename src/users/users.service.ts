import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

import { DrizzleService } from '../database/drizzle.service';
import { users } from '../database/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './types/user.type';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(userData: CreateUserDto): Promise<User> {
    const result = await this.drizzleService.db
      .insert(users)
      .values(userData)
      .returning();

    const user = result[0];
    if (!user) {
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async getByEmail(email: string): Promise<User> {
    const result = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const user = result[0];
    if (!user) {
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    // Return user with password for authentication
    return user as User;
  }

  async getById(id: number): Promise<User> {
    const result = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    const user = result[0];
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    // Remove password from response
    const { password, currentHashedRefreshToken, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData as User;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.drizzleService.db
      .update(users)
      .set({ currentHashedRefreshToken })
      .where(eq(users.id, userId));
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getByIdWithSensitiveData(userId);

    if (!user.currentHashedRefreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      const { password, currentHashedRefreshToken, ...userWithoutSensitiveData } = user;
      return userWithoutSensitiveData as User;
    }

    return null;
  }

  async removeRefreshToken(userId: number) {
    return this.drizzleService.db
      .update(users)
      .set({ currentHashedRefreshToken: null })
      .where(eq(users.id, userId));
  }

  private async getByIdWithSensitiveData(id: number) {
    const result = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    const user = result[0];
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
}