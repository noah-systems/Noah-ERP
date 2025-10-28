import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from '../redis/redis.module.js';
import { JwtModule } from './jwt/jwt.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { LeadsModule } from './leads/leads.module.js';
import { OppsModule } from './opps/opps.module.js';
import { ImplModule } from './impl/impl.module.js';
import { PricingModule } from './pricing/pricing.module.js';
import { PartnerModule } from './partner/partner.module.js';
import { WorkerModule } from './worker/worker.module.js';
import { RateLimitGuard } from './auth/rate-limit.guard.js';
import { HealthController } from '../health/health.controller.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for the API to start.');
}

@Module({
  imports: [
    RedisModule,
    JwtModule.register({ global: true, secret: JWT_SECRET }),
    AuthModule,
    UsersModule,
    LeadsModule,
    OppsModule,
    ImplModule,
    PricingModule,
    PartnerModule,
    WorkerModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService, { provide: APP_GUARD, useClass: RateLimitGuard }],
})
export class AppModule {}
