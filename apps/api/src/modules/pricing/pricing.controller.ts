import { Body, Controller, Get, Post } from '@nestjs/common';
import { PricingService } from './pricing.service';
import {
  CreateDiscountPolicyDto,
  CreatePriceItemDto,
  CreatePriceTierDto,
} from './pricing.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Get('items')
  listItems() {
    return this.pricing.listItems();
  }

  @Post('items')
  createItem(@Body() dto: CreatePriceItemDto) {
    return this.pricing.createItem(dto);
  }

  @Get('tiers')
  listTiers() {
    return this.pricing.listTiers();
  }

  @Post('tiers')
  createTier(@Body() dto: CreatePriceTierDto) {
    return this.pricing.createTier(dto);
  }

  @Get('discount-policy')
  listDiscounts() {
    return this.pricing.listDiscountPolicies();
  }

  @Post('discount-policy')
  createDiscount(@Body() dto: CreateDiscountPolicyDto) {
    return this.pricing.createDiscountPolicy(dto);
  }
}
