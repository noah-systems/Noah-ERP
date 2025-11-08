import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { OPPORTUNITY_REPOSITORY } from '../../database/database.module.js';
import {
  Opportunity,
  OpportunityAttributes,
  OpportunityCreationAttributes,
  OpportunityJSON,
  toOpportunityJSON,
} from './opportunity.model.js';
import { CreateOpportunityDto, UpdateOpportunityDto } from './opps.dto.js';
import { OPPORTUNITY_STAGES, type OpportunityStage } from './opportunity.types.js';

type GroupedOpportunities = Record<OpportunityStage, OpportunityJSON[]>;

function createEmptyGrouped(): GroupedOpportunities {
  return OPPORTUNITY_STAGES.reduce((acc, stage) => {
    acc[stage] = [];
    return acc;
  }, {} as GroupedOpportunities);
}

function sanitizeTags(tags?: string[]): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const unique = new Set<string>();
  const sanitized: string[] = [];

  for (const raw of tags) {
    if (typeof raw !== 'string') continue;
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (unique.has(key)) continue;
    unique.add(key);
    sanitized.push(value);
    if (sanitized.length >= 20) break;
  }

  return sanitized;
}

function toDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

@Injectable()
export class OppsService {
  constructor(@Inject(OPPORTUNITY_REPOSITORY) private readonly model: typeof Opportunity) {}

  async listGrouped(q?: string): Promise<{ grouped: GroupedOpportunities }> {
    const where = q
      ? {
          [Op.or]: [
            { companyName: { [Op.iLike]: `%${q}%` } },
            { contactName: { [Op.iLike]: `%${q}%` } },
            { cnpj: { [Op.iLike]: `%${q}%` } },
            { subdomain: { [Op.iLike]: `%${q}%` } },
          ],
        }
      : undefined;

    const items = await this.model.findAll({ where, order: [['updatedAt', 'DESC']] });

    const grouped = createEmptyGrouped();
    for (const item of items) {
      const json = toOpportunityJSON(item);
      grouped[json.stage]?.push(json);
    }

    return { grouped };
  }

  async create(dto: CreateOpportunityDto): Promise<OpportunityJSON> {
    const payload: OpportunityCreationAttributes = {
      companyName: dto.companyName,
      cnpj: dto.cnpj ?? null,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail ?? null,
      contactPhone: dto.contactPhone ?? null,
      financeEmail: dto.financeEmail ?? null,
      financePhone: dto.financePhone ?? null,
      subdomain: dto.subdomain ?? null,
      amount: dto.amount,
      stage: dto.stage ?? 'NEGOTIATION',
      trialEndsAt: toDate(dto.trialEndsAt),
      ownerId: dto.ownerId,
      tags: sanitizeTags(dto.tags),
      lostReason: null,
    };

    const opportunity = await this.model.create(payload);
    return toOpportunityJSON(opportunity);
  }

  async update(id: string, dto: UpdateOpportunityDto): Promise<OpportunityJSON> {
    const opportunity = await this.model.findByPk(id);
    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada');
    }

    const updates: Partial<OpportunityAttributes> = {};
    if (dto.companyName !== undefined) updates.companyName = dto.companyName;
    if (dto.cnpj !== undefined) updates.cnpj = dto.cnpj ?? null;
    if (dto.contactName !== undefined) updates.contactName = dto.contactName;
    if (dto.contactEmail !== undefined) updates.contactEmail = dto.contactEmail ?? null;
    if (dto.contactPhone !== undefined) updates.contactPhone = dto.contactPhone ?? null;
    if (dto.financeEmail !== undefined) updates.financeEmail = dto.financeEmail ?? null;
    if (dto.financePhone !== undefined) updates.financePhone = dto.financePhone ?? null;
    if (dto.subdomain !== undefined) updates.subdomain = dto.subdomain ?? null;
    if (dto.amount !== undefined) updates.amount = dto.amount;
    if (dto.trialEndsAt !== undefined) updates.trialEndsAt = toDate(dto.trialEndsAt);
    if (dto.ownerId !== undefined) updates.ownerId = dto.ownerId;
    if (dto.tags !== undefined) updates.tags = sanitizeTags(dto.tags);

    await opportunity.update(updates);
    await opportunity.reload();
    return toOpportunityJSON(opportunity);
  }

  async move(id: string, stage: OpportunityStage): Promise<OpportunityJSON> {
    const opportunity = await this.model.findByPk(id);
    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada');
    }

    const update: Partial<OpportunityAttributes> = { stage };
    if (stage !== 'LOST') {
      update.lostReason = null;
    }

    await opportunity.update(update);
    await opportunity.reload();
    return toOpportunityJSON(opportunity);
  }

  async markLost(id: string, reason?: string): Promise<OpportunityJSON> {
    const opportunity = await this.model.findByPk(id);
    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada');
    }

    await opportunity.update({ stage: 'LOST', lostReason: reason?.trim() || null });
    await opportunity.reload();
    return toOpportunityJSON(opportunity);
  }
}
