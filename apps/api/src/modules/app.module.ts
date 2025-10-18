import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from './jwt/jwt.module';
import { PrismaService } from '../prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { OppsModule } from './opps/opps.module';
import { ImplModule } from './impl/impl.module';
import { PricingModule } from './pricing/pricing.module';
import { PartnerModule } from './partner/partner.module';
import { WorkerModule } from './worker/worker.module';
import { HealthModule } from './health/health.module';
import { RateLimitGuard } from './auth/rate-limit.guard';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for the API to start.');
}

@Module({
  imports: [
    JwtModule.register({ global: true, secret: JWT_SECRET }),
    AuthModule,
    UsersModule,
    LeadsModule,
    OppsModule,
    ImplModule,
    PricingModule,
    PartnerModule,
    WorkerModule,
    HealthModule,
  ],
  providers: [PrismaService, { provide: APP_GUARD, useClass: RateLimitGuard }],
})
export class AppModule {}
