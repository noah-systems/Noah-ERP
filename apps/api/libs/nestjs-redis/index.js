'use strict';

const { Global, Module, Inject, Injectable } = require('@nestjs/common');
const Redis = require('ioredis');

const REDIS_TOKEN = 'LIAOLIAOTS_NEST_REDIS_CLIENT';

function InjectRedis() {
  return Inject(REDIS_TOKEN);
}

@Global()
@Module({})
class RedisModule {
  static forRoot(options = {}) {
    const config = options.config ?? {};
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_TOKEN,
          useFactory: () => {
            const url = config.url ?? 'redis://127.0.0.1:6379';
            const opts = config.options ?? {};
            return new Redis(url, opts);
          },
        },
        RedisClientCleanup,
      ],
      exports: [REDIS_TOKEN],
    };
  }
}

@Injectable()
class RedisClientCleanup {
  constructor(@InjectRedis() client) {
    this.client = client;
  }

  async onModuleDestroy() {
    if (!this.client) return;
    if (typeof this.client.status === 'string' && this.client.status === 'end') {
      return;
    }
    try {
      await this.client.quit();
    } catch (error) {
      this.client.disconnect();
    }
  }
}

module.exports = {
  RedisModule,
  InjectRedis,
  REDIS_TOKEN,
};
