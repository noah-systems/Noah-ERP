import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service.js';
import { PricingController } from './pricing.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PricingController],
  providers: [PricingService, DatabaseService],
})
export class PricingModule {}
