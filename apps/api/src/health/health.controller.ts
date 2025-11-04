import { Controller, Get, Inject, Logger } from '@nestjs/common';
import type { Redis as RedisClient } from 'ioredis';
import { DatabaseService } from '../database/database.service.js';
import { REDIS_TOKEN } from '../redis/redis.module.js';

type HealthStatus = 'up' | 'down';

@Controller()
export class HealthController {
  constructor(
    private readonly database: DatabaseService,
    @Inject(REDIS_TOKEN) private readonly redis: RedisClient,
  ) {}

  private readonly logger = new Logger(HealthController.name);

  @Get(['health', 'api/health'])
  async getHealth() {
    const [db, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    return {
      ok: db === 'up' && redis === 'up',
      api: 'up' as const,
      db,
      redis,
      time: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      await this.database.queryRaw('SELECT 1');
      return 'up';
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(`Database check failed: ${error.message}`);
      }
      return 'down';
    }
  }

  private async checkRedis(): Promise<HealthStatus> {
    try {
      await this.redis.ping();
      return 'up';
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(`Redis check failed: ${error.message}`);
      }
      return 'down';
    }
  }
}
