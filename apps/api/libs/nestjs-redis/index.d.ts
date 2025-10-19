import type { DynamicModule } from '@nestjs/common';
import type { Redis, RedisOptions } from 'ioredis';

export interface RedisModuleConfig {
  url?: string;
  options?: RedisOptions;
}

export interface RedisModuleOptions {
  config?: RedisModuleConfig;
}

export declare const REDIS_TOKEN: string;
export declare function InjectRedis(): ParameterDecorator;
export declare class RedisModule {
  static forRoot(options?: RedisModuleOptions): DynamicModule;
}

export { Redis };
