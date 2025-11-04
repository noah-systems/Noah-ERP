import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { Channel } from '../../database/enums.js';
import {
  CreateDiscountPolicyDto,
  CreatePriceItemDto,
  CreatePriceTierDto,
} from './pricing.dto.js';

@Injectable()
export class PricingService {
  constructor(private readonly db: DatabaseService) {}

  listItems() {
    return this.db.priceItem
      .findAll({ order: [['name', 'ASC']] })
      .then((items) => items.map((item) => item.toJSON()));
  }

  async createItem(dto: CreatePriceItemDto) {
    const payload = {
      name: dto.name,
      price: Number.isFinite(dto.price) ? dto.price.toFixed(2) : '0.00',
      channel: dto.channel,
      kind: dto.kind,
      active: dto.active ?? true,
    };

    const existing = await this.db.priceItem.findOne({ where: { sku: dto.sku } });
    if (existing) {
      await existing.update(payload);
      return existing.toJSON();
    }

    const created = await this.db.priceItem.create({ sku: dto.sku, ...payload });
    return created.toJSON();
  }

  listTiers() {
    return this.db.priceTier
      .findAll({ order: [['minUsers', 'ASC']] })
      .then((items) => items.map((item) => item.toJSON()));
  }

  async createTier(dto: CreatePriceTierDto) {
    if (dto.channel !== Channel.WHITE_LABEL) {
      throw new BadRequestException('Tiers are only available for white label channel');
    }
    const created = await this.db.priceTier.create({
      channel: dto.channel,
      minUsers: dto.minUsers,
      maxUsers: dto.maxUsers ?? null,
      pricePerUser: Number.isFinite(dto.pricePerUser)
        ? dto.pricePerUser.toFixed(2)
        : '0.00',
    });
    return created.toJSON();
  }

  listDiscountPolicies() {
    return this.db.discountPolicy
      .findAll({ order: [['role', 'ASC']] })
      .then((items) => items.map((item) => item.toJSON()));
  }

  async createDiscountPolicy(dto: CreateDiscountPolicyDto) {
    const payload = {
      role: dto.role,
      maxPercent: Number.isFinite(dto.maxPercent) ? dto.maxPercent.toFixed(2) : '0.00',
    };

    const existing = await this.db.discountPolicy.findOne({ where: { role: dto.role } });
    if (existing) {
      await existing.update({ maxPercent: payload.maxPercent });
      return existing.toJSON();
    }

    const created = await this.db.discountPolicy.create(payload);
    return created.toJSON();
  }
}
