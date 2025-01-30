import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { session } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { comparePassword } from 'src/common/utils/comparePassword';
import { SessionValidationResult } from 'src/interfaces/user.types';
import { SignInDTO } from './session.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  //**  create the token
  generateSessionToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  //**  Create session for the user
  async createSession(token: string, userId: number): Promise<session> {
    try {
      const sessionId = crypto.createHash('sha256').update(token).digest('hex');
      const session: session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      };
      await this.prisma.session.create({
        data: session,
      });
      return session;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create session');
    }
  }

  //** validate session
  async validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = crypto.createHash('sha256').update(token).digest('hex');
    const result = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
    if (result === null) {
      return { session: null, user: null };
    }
    const { user, ...session } = result;
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.prisma.session.delete({ where: { id: sessionId } });
      return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await this.prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          expiresAt: session.expiresAt,
        },
      });
    }
    return { session, user };
  }

  //** invalidate the session
  async invalidateSession(sessionId: string): Promise<void> {
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  //* user sign-in
  async signIn(data: SignInDTO) {
    try {
      const { password, email } = data;
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException('user not found');
      }
      const isPasswordValid = await comparePassword({
        password,
        hashedPassword: user.password,
      });

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = await this.generateSessionToken();
      const session = await this.createSession(token, user.id);
      return {
        token: token,
        session: session,
      };
      //TO DO managin error
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
