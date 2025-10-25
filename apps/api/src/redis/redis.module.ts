import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_TOKEN = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_TOKEN,
      useFactory: () => {
        const host = process.env.REDIS_HOST || 'redis';
        const port = +(process.env.REDIS_PORT || '6379');
        const url = process.env.REDIS_URL || `redis://${host}:${port}`;
        return new Redis(url);
      },
    },
  ],
  exports: [REDIS_TOKEN],
})
export class RedisModule {}
