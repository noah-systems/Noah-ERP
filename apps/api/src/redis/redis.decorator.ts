import { Inject } from '@nestjs/common';
import { REDIS_TOKEN } from './redis.module.js';

export const InjectRedis = () => Inject(REDIS_TOKEN);
