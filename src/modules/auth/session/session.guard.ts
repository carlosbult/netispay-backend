import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionService } from './session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromCookies(request);
    if (!token) {
      throw new UnauthorizedException('No session token provided');
    }

    const result = await this.sessionService.validateSessionToken(token);
    if (!result.session || !result.user) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = result.user.role;
      if (!userRole || !requiredRoles.includes(userRole)) {
        throw new UnauthorizedException('Insufficient permissions');
      }
    }

    request.user = result.user;
    request.session = result.session;

    return true;
  }

  private extractTokenFromCookies(request: any): string | undefined {
    return request.cookies?.session_token;
  }
}
