import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Redis as RedisClient } from 'ioredis';
import { REDIS_TOKEN } from '../redis/redis.module.js';

type HealthStatus = 'ok' | 'down';

const packageJsonPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'package.json',
);
const { version: packageVersion } = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version: string };

@Controller()
export class HealthController {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @Inject(REDIS_TOKEN) private readonly redis: RedisClient,
  ) {}

  private readonly logger = new Logger(HealthController.name);

  @Get(['health', 'api/health'])
  async getHealth() {
    const [db, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    return {
      ok: db === 'ok' && redis === 'ok',
      api: 'ok' as const,
      db,
      redis,
      version: packageVersion,
      time: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      await this.sequelize.query('SELECT 1');
      return 'ok';
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
      return 'ok';
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(`Redis check failed: ${error.message}`);
      }
      return 'down';
    }
  }
}
