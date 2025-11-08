import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { LEAD_REPOSITORY } from '../database/database.module.js';
import { Lead, LeadAttributes, LeadCreationAttributes, LeadStatus, LEAD_STATUSES, toLeadJSON } from './lead.model.js';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto.js';

type GroupedLeads = Record<LeadStatus, LeadAttributes[]>;

@Injectable()
export class LeadsService {
  constructor(@Inject(LEAD_REPOSITORY) private readonly model: typeof Lead) {}

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
      const status = lead.status ?? 'NURTURING';
      grouped[status].push(toLeadJSON(lead));
    }

    return { grouped };
  }

  async create(dto: CreateLeadDto): Promise<LeadAttributes> {
    const payload: LeadCreationAttributes = {
      companyName: dto.companyName,
      segment: dto.segment ?? null,
      employeesCount: dto.employeesCount ?? null,
      contactName: dto.contactName ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      source: dto.source ?? null,
      status: 'NURTURING' as LeadStatus,
      ownerId: dto.ownerId ?? null,
      notes: dto.notes ?? null,
    };

    const lead = await this.model.create(payload);
    return toLeadJSON(lead);
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
    return toLeadJSON(lead);
  }

  async move(id: string, status: LeadStatus): Promise<LeadAttributes> {
    if (!LEAD_STATUSES.includes(status)) {
      throw new BadRequestException('Status inválido');
    }

    const lead = await this.model.findByPk(id);
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    await lead.update({ status });
    return toLeadJSON(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.model.findByPk(id);
    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }
    await lead.destroy();
  }
}
