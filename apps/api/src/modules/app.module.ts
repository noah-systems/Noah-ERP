import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from '../redis/redis.module.js';
import { JwtModule } from './jwt/jwt.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { LeadsModule } from '../leads/leads.module.js';
import { OppsModule } from './opps/opps.module.js';
import { ImplementationModule } from './implementation/implementation.module.js';
import { PricingModule } from './pricing/pricing.module.js';
import { PartnerModule } from './partner/partner.module.js';
import { WorkerModule } from './worker/worker.module.js';
import { RateLimitGuard } from './auth/rate-limit.guard.js';
import { HealthController } from '../health/health.controller.js';

const DEFAULT_JWT_SECRET = 'insecure-development-secret';

const JWT_SECRET =
  process.env.JWT_SECRET ??
  (process.env.NODE_ENV === 'production' ? undefined : DEFAULT_JWT_SECRET);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for the API to start.');
}

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    'JWT_SECRET environment variable is not defined. Using an insecure development fallback secret.',
  );
}

@Module({
  imports: [
    RedisModule,
    DatabaseModule,
    JwtModule.register({ global: true, secret: JWT_SECRET }),
    AuthModule,
    UsersModule,
    LeadsModule,
    OppsModule,
    ImplementationModule,
    PricingModule,
    PartnerModule,
    WorkerModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: RateLimitGuard }],
})
export class AppModule {}
