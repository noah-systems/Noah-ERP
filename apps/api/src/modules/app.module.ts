import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadsModule } from './leads/leads.module';
import { OppsModule } from './opps/opps.module';
import { ImplModule } from './impl/impl.module';
import { PricingModule } from './pricing/pricing.module';
import { PartnerModule } from './partner/partner.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET }),
    AuthModule,
    UsersModule,
    LeadsModule,
    OppsModule,
    ImplModule,
    PricingModule,
    PartnerModule,
    WorkerModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
