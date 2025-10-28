import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service.js';
import { PricingController } from './pricing.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PricingController],
  providers: [PricingService, PrismaService],
})
export class PricingModule {}
