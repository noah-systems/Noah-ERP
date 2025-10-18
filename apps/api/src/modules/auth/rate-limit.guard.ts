import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface RateBucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, RateBucket>();
  private readonly limit: number;
  private readonly ttlMs: number;

  constructor() {
    const limit = Number(process.env.RATE_LIMIT_LIMIT || 120);
    const ttl = Number(process.env.RATE_LIMIT_TTL || 60);
    this.limit = Number.isFinite(limit) && limit > 0 ? limit : 0;
    this.ttlMs = Number.isFinite(ttl) && ttl > 0 ? ttl * 1000 : 60000;
  }

  canActivate(context: ExecutionContext): boolean {
    if (this.limit <= 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ ip?: string; headers?: Record<string, string | string[]> }>();
    const response = context.switchToHttp().getResponse<{ setHeader?: (name: string, value: string) => void }>();
    const now = Date.now();
    const key = this.resolveKey(request);
    if (!key) {
      return true;
    }
    const bucket = this.hits.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.ttlMs });
      this.setHeaders(response, 1, now + this.ttlMs);
      return true;
    }
    if (bucket.count >= this.limit) {
      this.setHeaders(response, bucket.count, bucket.resetAt);
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    bucket.count += 1;
    this.setHeaders(response, bucket.count, bucket.resetAt);
    return true;
  }

  private resolveKey(request: { ip?: string; headers?: Record<string, string | string[]> }): string | null {
    const forwarded = request.headers?.['x-forwarded-for'];
    const candidate = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return candidate?.split(',')[0]?.trim() || request.ip || null;
  }

  private setHeaders(
    response: { setHeader?: (name: string, value: string) => void },
    count: number,
    resetAt: number
  ) {
    if (!response?.setHeader) return;
    response.setHeader('X-RateLimit-Limit', String(this.limit));
    response.setHeader('X-RateLimit-Remaining', String(Math.max(this.limit - count, 0)));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
  }
}
