import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { eq, and } from 'drizzle-orm';
import * as schema from '../database/schema';
import { CreateUser, User } from '../database/types';

export interface JwtPayload {
  sub: number;
  email: string;
  schoolId: number;
  userType: string;
  iat?: number;
  exp?: number;
}

// Add this interface for login data
export interface LoginUserData {
  userId: number;
  email: string;
  userType: string;
  schoolId: number;
  relatedEntityId?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string, schoolId?: number): Promise<User | null> {
    const whereClause = schoolId 
      ? and(eq(schema.userAccounts.email, email), eq(schema.userAccounts.schoolId, schoolId))
      : eq(schema.userAccounts.email, email);

    const user = await this.databaseService.db.query.userAccounts.findFirst({
      where: whereClause,
    });

    if (user && user.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, refreshTokenHash, ...result } = user;
      return result as User;
    }
    return null;
  }

  // Modified login method to accept LoginUserData or User
  async login(userData: LoginUserData | User) {
    const payload: JwtPayload = { 
      sub: userData.userId, 
      email: userData.email, 
      schoolId: userData.schoolId,
      userType: userData.userType,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    // Store hashed refresh token
    await this.updateRefreshToken(userData.userId, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        userId: userData.userId,
        email: userData.email,
        userType: userData.userType,
        schoolId: userData.schoolId,
      },
    };
  }

  // Alternative: Create a separate method specifically for JWT-based login
  async loginFromJwt(jwtUser: LoginUserData) {
    return this.login(jwtUser);
  }

  // Or if you prefer, create a method that fetches the full user and then logs in
  async loginById(userId: number) {
    const user = await this.databaseService.db.query.userAccounts.findFirst({
      where: eq(schema.userAccounts.userId, userId),
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, refreshTokenHash, ...userData } = user;
    return this.login(userData as User);
  }

  async register(userData: CreateUser & { password: string }): Promise<User> {
    const existingUser = await this.databaseService.db.query.userAccounts.findFirst({
      where: and(
        eq(schema.userAccounts.email, userData.email),
        eq(schema.userAccounts.schoolId, userData.schoolId),
      ),
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [newUser] = await this.databaseService.db
      .insert(schema.userAccounts)
      .values({
        ...userData,
        passwordHash: hashedPassword,
      })
      .returning();

    const { passwordHash, refreshTokenHash, ...result } = newUser;
    return result as User;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.databaseService.db.query.userAccounts.findFirst({
      where: eq(schema.userAccounts.userId, userId),
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: JwtPayload = { 
      sub: user.userId, 
      email: user.email, 
      schoolId: user.schoolId,
      userType: user.userType,
    };

    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    await this.updateRefreshToken(userId, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number) {
    await this.databaseService.db
      .update(schema.userAccounts)
      .set({ refreshTokenHash: null })
      .where(eq(schema.userAccounts.userId, userId));
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.databaseService.db
      .update(schema.userAccounts)
      .set({ 
        refreshTokenHash: hashedRefreshToken,
        lastLoginDate: new Date(),
      })
      .where(eq(schema.userAccounts.userId, userId));
  }

  getCookieWithJwtAccessToken(token: string) {
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
  }

  getCookieWithJwtRefreshToken(token: string) {
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
    return { cookie, token };
  }

  getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }
}