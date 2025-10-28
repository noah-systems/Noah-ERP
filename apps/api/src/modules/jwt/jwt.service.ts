import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { JWT_SECRET_TOKEN } from './jwt.constants.js';

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_SECRET_TOKEN) private readonly secret: string) {}

  private signPayload(data: string): string {
    return createHmac('sha256', this.secret).update(data).digest('base64url');
  }

  async signAsync(payload: Record<string, unknown>): Promise<string> {
    if (!this.secret) {
      throw new Error('JWT secret not configured');
    }
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const claims = { ...payload, iat: Math.floor(Date.now() / 1000) };
    const body = base64UrlEncode(JSON.stringify(claims));
    const signature = this.signPayload(`${header}.${body}`);
    return `${header}.${body}.${signature}`;
  }

  async verifyAsync<T extends Record<string, unknown> = Record<string, unknown>>(
    token: string
  ): Promise<T> {
    if (!this.secret) {
      throw new UnauthorizedException();
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException();
    }
    const [header, payload, signature] = parts;
    const expectedSignature = this.signPayload(`${header}.${payload}`);
    const signatureBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException();
    }
    try {
      return JSON.parse(base64UrlDecode(payload)) as T;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
