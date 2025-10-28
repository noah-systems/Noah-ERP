import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Role } from '@prisma/client';
import { JwtService } from '../jwt/jwt.service.js';

type HttpRequest = {
  headers?: Record<string, string | string[] | undefined>;
  user?: Express.UserPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<HttpRequest>();
    const authHeader = request.headers?.authorization ?? request.headers?.Authorization;
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (typeof headerValue !== 'string' || !headerValue.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const token = headerValue.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException();
    }
    const payload = await this.jwt.verifyAsync<{ sub: string; role?: Role }>(token);
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }
    request.user = { id: payload.sub, role: payload.role, token };
    return true;
  }
}
