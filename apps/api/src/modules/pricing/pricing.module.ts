import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service.js';
import { PricingController } from './pricing.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { PriceItem } from '../../database/models/price-item.model.js';
import { PriceTier } from '../../database/models/price-tier.model.js';
import { DiscountPolicy } from '../../database/models/discount-policy.model.js';

@Module({
  imports: [AuthModule, SequelizeModule.forFeature([PriceItem, PriceTier, DiscountPolicy])],
  controllers: [PricingController],
  providers: [PricingService],
})
export class PricingModule {}
