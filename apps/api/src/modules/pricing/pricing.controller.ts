import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import {
  CreateDiscountPolicyDto,
  CreatePriceItemDto,
  CreatePriceTierDto,
} from './pricing.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Roles(Role.ADMIN_NOAH, Role.SUPPORT_NOAH, Role.SELLER)
  @Get('items')
  listItems() {
    return this.pricing.listItems();
  }

  @Roles(Role.ADMIN_NOAH)
  @Post('items')
  createItem(@Body() dto: CreatePriceItemDto) {
    return this.pricing.createItem(dto);
  }

  @Roles(Role.ADMIN_NOAH, Role.SUPPORT_NOAH, Role.SELLER)
  @Get('tiers')
  listTiers() {
    return this.pricing.listTiers();
  }

  @Roles(Role.ADMIN_NOAH)
  @Post('tiers')
  createTier(@Body() dto: CreatePriceTierDto) {
    return this.pricing.createTier(dto);
  }

  @Roles(Role.ADMIN_NOAH, Role.SUPPORT_NOAH, Role.SELLER)
  @Get('discount-policy')
  listDiscounts() {
    return this.pricing.listDiscountPolicies();
  }

  @Roles(Role.ADMIN_NOAH)
  @Post('discount-policy')
  createDiscount(@Body() dto: CreateDiscountPolicyDto) {
    return this.pricing.createDiscountPolicy(dto);
  }
}
