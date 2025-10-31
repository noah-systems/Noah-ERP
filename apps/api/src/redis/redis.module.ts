import { Global, Logger, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { resolveRedisUrl } from './redis.config.js';

export const REDIS_TOKEN = 'REDIS_CLIENT';

function maskRedisUrl(url: string) {
  if (!url) {
    return '(unknown redis url)';
  }

  return url.replace(/\/\/([^:@]+):[^@]*@/, (_, user: string) => `//${user}:***@`);
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS_TOKEN,
      useFactory: () => {
        const url = resolveRedisUrl();
        const logger = new Logger('RedisModule');
        const client = new Redis(url, {
          lazyConnect: true,
          maxRetriesPerRequest: null,
          retryStrategy: (times) => Math.min(5000, 300 + times * 200),
        });

        const maskedUrl = maskRedisUrl(url);
        client.on('error', (error) => {
          const reason = error instanceof Error ? error.message : String(error);
          logger.error(`Redis connection error (${maskedUrl}): ${reason}`);
        });

        client.on('connect', () => {
          logger.log(`Connected to Redis (${maskedUrl})`);
        });

        client.on('reconnecting', () => {
          logger.warn(`Reconnecting to Redis (${maskedUrl})`);
        });

        void client.connect().catch((error) => {
          const reason = error instanceof Error ? error.message : String(error);
          logger.error(`Initial Redis connection attempt failed (${maskedUrl}): ${reason}`);
        });

        return client;
      },
    },
  ],
  exports: [REDIS_TOKEN],
})
export class RedisModule {}
