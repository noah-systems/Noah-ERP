import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { resolveRedisUrl } from './redis.config';

export const REDIS_TOKEN = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_TOKEN,
      useFactory: () => {
        const url = resolveRedisUrl();
        return new Redis(url);
      },
    },
  ],
  exports: [REDIS_TOKEN],
})
export class RedisModule {}
