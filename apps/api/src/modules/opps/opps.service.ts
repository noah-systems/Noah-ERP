import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { WorkerService } from '../worker/worker.service.js';
import {
  ApplyPricingDto,
  CreateOpportunityDto,
  MarkOpportunityLostDto,
  UpdateOppStageDto,
} from './opps.dto.js';

@Injectable()
export class OppsService {
  constructor(private readonly db: DatabaseService, private readonly worker: WorkerService) {}

  list() {
    return this.db.opportunity
      .findAll({
        include: [
          { association: 'owner' },
          { association: 'stage' },
          { association: 'lead' },
          { association: 'hosting' },
        ],
        order: [['createdAt', 'DESC']],
      })
      .then((items) => items.map((item) => item.toJSON()));
  }

  async create(dto: CreateOpportunityDto) {
    const data = {
      ownerId: dto.ownerId,
      stageId: dto.stageId,
      leadId: dto.leadId ?? null,
      legalName: dto.legalName ?? null,
      cnpj: dto.cnpj ?? null,
      address: dto.address ?? null,
      subdomain: dto.subdomain ?? null,
      users: dto.users ?? 0,
      whatsapp: dto.whatsapp ?? 0,
      instagram: dto.instagram ?? 0,
      facebook: dto.facebook ?? 0,
      waba: dto.waba ?? 0,
      hostingId: dto.hostingId ?? null,
      serverIp: dto.serverIp ?? null,
      trialStart: dto.trialStart ? new Date(dto.trialStart) : null,
      activation: dto.activation ? new Date(dto.activation) : null,
      billingBaseDay: dto.billingBaseDay ?? null,
    };

    const created = await this.db.opportunity.create(data);
    const opportunity = await this.db.opportunity.findByPk(created.get('id') as string, {
      include: [
        { association: 'owner' },
        { association: 'stage' },
        { association: 'lead' },
        { association: 'hosting' },
      ],
    });

    if (dto.trialStart && opportunity) {
      await this.scheduleTrialJobs(opportunity.get('id') as string, dto.trialStart);
    }

    if (!opportunity) {
      throw new NotFoundException('opportunity');
    }

    return opportunity.toJSON();
  }

  async updateStage(id: string, dto: UpdateOppStageDto) {
    const opportunity = await this.db.opportunity.findByPk(id, {
      include: [
        { association: 'owner' },
        { association: 'stage' },
        { association: 'lead' },
        { association: 'hosting' },
      ],
    });
    if (!opportunity) {
      throw new NotFoundException('opportunity');
    }

    await opportunity.update({ stageId: dto.stageId });
    await opportunity.reload({
      include: [
        { association: 'owner' },
        { association: 'stage' },
        { association: 'lead' },
        { association: 'hosting' },
      ],
    });

    const stage = opportunity.get('stage') as { name?: string } | undefined;
    await this.db.oppHistory.create({
      oppId: id,
      actorId: dto.actorId,
      note: dto.note ?? `Stage changed to ${stage?.name ?? ''}`,
    });

    return opportunity.toJSON();
  }

  async applyPricing(id: string, dto: ApplyPricingDto) {
    const total = (dto.items || []).reduce((acc, item) => {
      const price = Number((item as any)?.price ?? 0);
      const quantity = Number((item as any)?.quantity ?? 0);
      return acc + price * quantity;
    }, 0);

    const opportunity = await this.db.opportunity.findByPk(id, {
      include: [
        { association: 'owner' },
        { association: 'stage' },
        { association: 'lead' },
        { association: 'hosting' },
      ],
    });
    if (!opportunity) {
      throw new NotFoundException('opportunity');
    }

    await opportunity.update({ priceTotal: total.toFixed(2) });
    await opportunity.reload({
      include: [
        { association: 'owner' },
        { association: 'stage' },
        { association: 'lead' },
        { association: 'hosting' },
      ],
    });

    await this.db.oppHistory.create({
      oppId: id,
      actorId: opportunity.get('ownerId') as string,
      note: `Pricing applied: total ${total.toFixed(2)}`,
    });

    return opportunity.toJSON();
  }

  async markLost(id: string, dto: MarkOpportunityLostDto) {
    const lostStage = await this.db.opportunityStage.findOne({
      where: { lostReasonRequired: true },
      order: [['order', 'DESC']],
    });

    const opportunity = await this.db.opportunity.findByPk(id, {
      include: [
        { association: 'owner' },
        { association: 'stage' },
        { association: 'lead' },
        { association: 'hosting' },
      ],
    });
    if (!opportunity) {
      throw new NotFoundException('opportunity');
    }

    await opportunity.update({ stageId: lostStage?.get('id') ?? null });
    await opportunity.reload({
      include: [
        { association: 'owner' },
        { association: 'stage' },
        { association: 'lead' },
        { association: 'hosting' },
      ],
    });

    await this.db.oppHistory.create({
      oppId: id,
      actorId: dto.actorId,
      note: `Venda perdida: ${dto.reason}${dto.summary ? ` - ${dto.summary}` : ''}`,
    });

    return opportunity.toJSON();
  }

  private async scheduleTrialJobs(oppId: string, trialStartISO: string) {
    const start = new Date(trialStartISO);
    if (Number.isNaN(start.getTime())) {
      return;
    }
    const now = Date.now();
    const dMinus5Delay = Math.max(0, start.getTime() - 5 * 24 * 60 * 60 * 1000 - now);
    const endDelay = Math.max(0, start.getTime() + 14 * 24 * 60 * 60 * 1000 - now);
    await this.worker.enqueue('trial-dminus5', { oppId }, dMinus5Delay);
    await this.worker.enqueue('trial-end', { oppId }, endDelay);
  }
}
