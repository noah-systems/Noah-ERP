import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Channel } from '../../database/enums.js';
import { DiscountPolicy } from '../../database/models/discount-policy.model.js';
import { PriceItem } from '../../database/models/price-item.model.js';
import { PriceTier } from '../../database/models/price-tier.model.js';
import {
  CreateDiscountPolicyDto,
  CreatePriceItemDto,
  CreatePriceTierDto,
} from './pricing.dto.js';

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(PriceItem) private readonly priceItems: typeof PriceItem,
    @InjectModel(PriceTier) private readonly priceTiers: typeof PriceTier,
    @InjectModel(DiscountPolicy) private readonly discountPolicies: typeof DiscountPolicy,
  ) {}

  async listItems() {
    const items = await this.priceItems.findAll({ order: [['name', 'ASC']] });
    return items.map((item) => item.toJSON());
  }

  async createItem(dto: CreatePriceItemDto) {
    const payload = {
      name: dto.name,
      price: Number.isFinite(dto.price) ? dto.price.toFixed(2) : '0.00',
      channel: dto.channel,
      kind: dto.kind,
      active: dto.active ?? true,
    };

    const existing = await this.priceItems.findOne({ where: { sku: dto.sku } });
    if (existing) {
      await existing.update(payload);
      return existing.toJSON();
    }

    const created = await this.priceItems.create({ sku: dto.sku, ...payload });
    return created.toJSON();
  }

  async listTiers() {
    const items = await this.priceTiers.findAll({ order: [['minUsers', 'ASC']] });
    return items.map((item) => item.toJSON());
  }

  async createTier(dto: CreatePriceTierDto) {
    if (dto.channel !== Channel.WHITE_LABEL) {
      throw new BadRequestException('Tiers are only available for white label channel');
    }
    const created = await this.priceTiers.create({
      channel: dto.channel,
      minUsers: dto.minUsers,
      maxUsers: dto.maxUsers ?? null,
      pricePerUser: Number.isFinite(dto.pricePerUser)
        ? dto.pricePerUser.toFixed(2)
        : '0.00',
    });
    return created.toJSON();
  }

  async listDiscountPolicies() {
    const items = await this.discountPolicies.findAll({ order: [['role', 'ASC']] });
    return items.map((item) => item.toJSON());
  }

  async createDiscountPolicy(dto: CreateDiscountPolicyDto) {
    const payload = {
      role: dto.role,
      maxPercent: Number.isFinite(dto.maxPercent) ? dto.maxPercent.toFixed(2) : '0.00',
    };

    const existing = await this.discountPolicies.findOne({ where: { role: dto.role } });
    if (existing) {
      await existing.update({ maxPercent: payload.maxPercent });
      return existing.toJSON();
    }

    const created = await this.discountPolicies.create(payload);
    return created.toJSON();
  }
}
