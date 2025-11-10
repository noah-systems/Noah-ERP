import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Lead } from '../database/models/lead.model.js';
import { LeadStatusValue, LEAD_STATUSES } from '../database/models/lead.model.js';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto.js';

type LeadAttributes = {
  id: string;
  companyName: string;
  segment: string | null;
  employeesCount: number | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  status: LeadStatusValue;
  ownerId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type GroupedLeads = Record<LeadStatusValue, LeadAttributes[]>;

@Injectable()
export class LeadsService {
  constructor(@InjectModel(Lead) private readonly model: typeof Lead) {}

  async findAll(query: { q?: string }): Promise<{ grouped: GroupedLeads }> {
    const where = query.q
      ? {
          [Op.or]: [
            { companyName: { [Op.iLike]: `%${query.q}%` } },
            { contactName: { [Op.iLike]: `%${query.q}%` } },
            { email: { [Op.iLike]: `%${query.q}%` } },
            { phone: { [Op.iLike]: `%${query.q}%` } },
          ],
        }
      : undefined;

    const leads = await this.model.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });

    const grouped: GroupedLeads = {
      NURTURING: [],
      QUALIFIED: [],
      DISQUALIFIED: [],
    };

    for (const lead of leads) {
      const status = lead.status ?? LeadStatusValue.NURTURING;
      grouped[status].push(lead.get({ plain: true }) as LeadAttributes);
    }

    return { grouped };
  }

  async create(dto: CreateLeadDto): Promise<LeadAttributes> {
    const payload = {
      companyName: dto.companyName,
      segment: dto.segment ?? null,
      employeesCount: dto.employeesCount ?? null,
      contactName: dto.contactName ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      source: dto.source ?? null,
      status: LeadStatusValue.NURTURING,
      ownerId: dto.ownerId ?? null,
      notes: dto.notes ?? null,
    };

    const lead = await this.model.create(payload);
    return lead.get({ plain: true }) as LeadAttributes;
  }

  async update(id: string, dto: UpdateLeadDto): Promise<LeadAttributes> {
    const lead = await this.model.findByPk(id);
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const fields: Partial<LeadAttributes> = {};
    if (dto.companyName !== undefined) fields.companyName = dto.companyName;
    if (dto.segment !== undefined) fields.segment = dto.segment;
    if (dto.employeesCount !== undefined) fields.employeesCount = dto.employeesCount;
    if (dto.contactName !== undefined) fields.contactName = dto.contactName;
    if (dto.phone !== undefined) fields.phone = dto.phone;
    if (dto.email !== undefined) fields.email = dto.email;
    if (dto.source !== undefined) fields.source = dto.source;
    if (dto.ownerId !== undefined) fields.ownerId = dto.ownerId;
    if (dto.notes !== undefined) fields.notes = dto.notes;

    await lead.update(fields);
    return lead.get({ plain: true }) as LeadAttributes;
  }

  async move(id: string, status: LeadStatusValue): Promise<LeadAttributes> {
    if (!LEAD_STATUSES.includes(status)) {
      throw new BadRequestException('Status inválido');
    }

    const lead = await this.model.findByPk(id);
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    await lead.update({ status });
    return lead.get({ plain: true }) as LeadAttributes;
  }

  async remove(id: string): Promise<void> {
    const lead = await this.model.findByPk(id);
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }
    await lead.destroy();
  }
}
