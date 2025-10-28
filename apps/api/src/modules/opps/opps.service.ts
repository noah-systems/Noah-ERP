import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WorkerService } from '../worker/worker.service.js';
import {
  ApplyPricingDto,
  CreateOpportunityDto,
  MarkOpportunityLostDto,
  UpdateOppStageDto,
} from './opps.dto.js';

@Injectable()
export class OppsService {
  constructor(private readonly prisma: PrismaService, private readonly worker: WorkerService) {}

  list() {
    return this.prisma.opportunity.findMany({
      include: { owner: true, stage: true, lead: true, hosting: true },
      orderBy: { createdAt: 'desc' },
    });
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
    } satisfies Prisma.OpportunityUncheckedCreateInput;

    const opportunity = await this.prisma.opportunity.create({
      data,
      include: { owner: true, stage: true, lead: true, hosting: true },
    });

    if (dto.trialStart) {
      await this.scheduleTrialJobs(opportunity.id, dto.trialStart);
    }

    return opportunity;
  }

  async updateStage(id: string, dto: UpdateOppStageDto) {
    const opportunity = await this.prisma.opportunity.update({
      where: { id },
      data: { stageId: dto.stageId },
      include: { owner: true, stage: true, lead: true, hosting: true },
    });

    await this.prisma.oppHistory.create({
      data: {
        oppId: id,
        actorId: dto.actorId,
        note: dto.note ?? `Stage changed to ${opportunity.stage.name}`,
      },
    });

    return opportunity;
  }

  async applyPricing(id: string, dto: ApplyPricingDto) {
    const total = (dto.items || []).reduce((acc, item) => {
      const price = Number((item as any)?.price ?? 0);
      const quantity = Number((item as any)?.quantity ?? 0);
      return acc + price * quantity;
    }, 0);

    const opportunity = await this.prisma.opportunity.update({
      where: { id },
      data: { priceTotal: new Prisma.Decimal(total) },
      include: { owner: true, stage: true, lead: true, hosting: true },
    });

    await this.prisma.oppHistory.create({
      data: {
        oppId: id,
        actorId: opportunity.ownerId,
        note: `Pricing applied: total ${total.toFixed(2)}`,
      },
    });

    return opportunity;
  }

  async markLost(id: string, dto: MarkOpportunityLostDto) {
    const lostStage = await this.prisma.opportunityStage.findFirst({
      where: { lostReasonRequired: true },
      orderBy: { order: 'desc' },
    });

    const opportunity = await this.prisma.opportunity.update({
      where: { id },
      data: { stageId: lostStage?.id },
      include: { owner: true, stage: true, lead: true, hosting: true },
    });

    await this.prisma.oppHistory.create({
      data: {
        oppId: id,
        actorId: dto.actorId,
        note: `Venda perdida: ${dto.reason}${dto.summary ? ` - ${dto.summary}` : ''}`,
      },
    });

    return opportunity;
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
