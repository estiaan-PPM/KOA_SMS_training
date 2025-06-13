import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import RegisterDto from './dto/register.dto';
import PostgresErrorCode from '../database/postgresErrorCodes.enum';
import TokenPayload from './tokenPayload.interface';
import { WrongCredentialsException } from './wrongCredentialsException';
 
@Injectable()
export class AuthenticationService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
 
  public async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error?.code === PostgresErrorCode.UniqueViolation) {
          throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
        }
        throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new WrongCredentialsException;
    }
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
  const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword
    );
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  private async getUserByEmail(email: string) {
    try {
      return await this.usersService.getByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new WrongCredentialsException();
      }
      throw error;
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
  }

  getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

}

function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && 
         error !== null && 
         'code' in error && 
         typeof (error as any).code === 'string';
}