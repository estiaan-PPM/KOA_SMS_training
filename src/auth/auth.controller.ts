import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
    const loginResult = await this.authService.login(req.user);
    
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(loginResult.accessToken);
    const { cookie: refreshTokenCookie } = this.authService.getCookieWithJwtRefreshToken(loginResult.refreshToken);

    response.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    
    return loginResult;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Request() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.Refresh;
    const tokens = await this.authService.refreshTokens(req.user.userId, refreshToken);
    
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(tokens.accessToken);
    const { cookie: refreshTokenCookie } = this.authService.getCookieWithJwtRefreshToken(tokens.refreshToken);

    response.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    
    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  async logout(@Request() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(req.user.userId);
    response.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}