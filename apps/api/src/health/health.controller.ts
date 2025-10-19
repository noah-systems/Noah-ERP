import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Get()
  async ok() {
    await this.prisma.$queryRaw`SELECT 1`;
    await this.redis.ping();
    return { ok: true, ts: new Date().toISOString() };
  }
}
