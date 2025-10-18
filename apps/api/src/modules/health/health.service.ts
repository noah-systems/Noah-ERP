import { Injectable } from '@nestjs/common';
import IORedis from 'ioredis';
import { PrismaService } from '../../prisma.service';

type HealthCheckStatus = {
  status: 'ok' | 'error';
  latencyMs?: number;
  error?: string;
};

type HealthReport = {
  ok: boolean;
  database: HealthCheckStatus;
  redis: HealthCheckStatus;
};

@Injectable()
export class HealthService {
  constructor(private readonly db: PrismaService) {}

  private getRedisClient() {
    const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    return new IORedis(url, { lazyConnect: true });
  }

  async check(): Promise<HealthReport> {
    const database: HealthCheckStatus = { status: 'ok' };
    const redis: HealthCheckStatus = { status: 'ok' };

    const startedDb = Date.now();
    try {
      await this.db.$queryRaw`SELECT 1`;
      database.latencyMs = Date.now() - startedDb;
    } catch (error) {
      database.status = 'error';
      database.error = error instanceof Error ? error.message : 'unknown-error';
    }

    const startedRedis = Date.now();
    const client = this.getRedisClient();
    try {
      await client.connect();
      await client.ping();
      redis.latencyMs = Date.now() - startedRedis;
    } catch (error) {
      redis.status = 'error';
      redis.error = error instanceof Error ? error.message : 'unknown-error';
    } finally {
      if (client.status === 'ready') {
        await client.quit();
      } else {
        client.disconnect();
      }
    }

    return {
      ok: database.status === 'ok' && redis.status === 'ok',
      database,
      redis,
    };
  }
}
