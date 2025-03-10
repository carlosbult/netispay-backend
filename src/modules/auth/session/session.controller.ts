import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from './role.decorator';
import { GetSession, GetUser } from './session.decorator';
import { SignInDTO } from './session.dto';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('session-sign-in')
@ApiTags('Session Sign In')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async signIn(
    @Body() signInDto: SignInDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.sessionService.signIn(signInDto);
      res.cookie('session_token', result.token, {
        // httpOnly: true,
        // sameSite: 'strict',
        // secure: process.env.NODE_ENV === 'production',
        // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return {
        message: 'Login successful',
        data: {
          session: result.session,
        },
      };
    } catch (error) {
      console.log(error.message);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  @UseGuards(SessionGuard)
  @Get('login-test')
  async loginTest(
    @Res({ passthrough: true }) res: Response,
    @GetUser() user,
    @GetSession() session,
  ) {
    return {
      message: 'User is logged in',
      user: user,
      session: session,
    };
  }

  @UseGuards(SessionGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  async adminOnly(@GetUser() user) {
    return {
      message: 'Admin access granted',
      user: user,
    };
  }
}
