import { BadRequestException, Injectable } from '@nestjs/common';
import { Channel, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CreateDiscountPolicyDto,
  CreatePriceItemDto,
  CreatePriceTierDto,
} from './pricing.dto';

@Injectable()
export class PricingService {
  constructor(private readonly db: PrismaService) {}

  listItems() {
    return this.db.priceItem.findMany({ orderBy: { name: 'asc' } });
  }

  async createItem(dto: CreatePriceItemDto) {
    return this.db.priceItem.upsert({
      where: { sku: dto.sku },
      update: {
        name: dto.name,
        price: new Prisma.Decimal(dto.price.toFixed(2)),
        channel: dto.channel,
        kind: dto.kind,
        active: dto.active ?? true,
      },
      create: {
        sku: dto.sku,
        name: dto.name,
        price: new Prisma.Decimal(dto.price.toFixed(2)),
        channel: dto.channel,
        kind: dto.kind,
        active: dto.active ?? true,
      },
    });
  }

  listTiers() {
    return this.db.priceTier.findMany({ orderBy: { minUsers: 'asc' } });
  }

  async createTier(dto: CreatePriceTierDto) {
    if (dto.channel !== Channel.WHITE_LABEL) {
      throw new BadRequestException('Tiers are only available for white label channel');
    }
    return this.db.priceTier.create({
      data: {
        channel: dto.channel,
        minUsers: dto.minUsers,
        maxUsers: dto.maxUsers ?? null,
        pricePerUser: new Prisma.Decimal(dto.pricePerUser.toFixed(2)),
      },
    });
  }

  listDiscountPolicies() {
    return this.db.discountPolicy.findMany({ orderBy: { role: 'asc' } });
  }

  async createDiscountPolicy(dto: CreateDiscountPolicyDto) {
    const where: Prisma.DiscountPolicyWhereUniqueInput = { role: dto.role };
    return this.db.discountPolicy.upsert({
      where,
      update: { maxPercent: new Prisma.Decimal(dto.maxPercent.toFixed(2)) },
      create: {
        role: dto.role,
        maxPercent: new Prisma.Decimal(dto.maxPercent.toFixed(2)),
      },
    });
  }
}
