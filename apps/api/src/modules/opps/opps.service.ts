import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WorkerService } from '../worker/worker.service';

type CreateOpportunityDto = {
  ownerId: string; leadId?: string; stageId: string; legalName?: string; cnpj?: string; address?: string;
  subdomain?: string; users?: number; whatsapp?: number; instagram?: number; facebook?: number; waba?: number;
  hostingId?: string; serverIp?: string; trialStart?: string | Date; activation?: string | Date; billingBaseDay?: number;
};
type UpdateOppStageDto = { stageId: string; actorId?: string; note?: string; };
type PricingItem = { sku: string; price: number; quantity: number };
type ApplyPricingDto = { channel: 'INTERNAL' | 'WHITE_LABEL'; items: PricingItem[]; role?: string; discountPct?: number; users?: number; };
type MarkOpportunityLostDto = { actorId: string; reason?: string; summary?: string; };

@Injectable()
export class OppsService {
  constructor(private readonly db: PrismaService, private readonly worker: WorkerService) {}

  list() {
    return this.db.opportunity.findMany({ include: { owner: true, stage: true, lead: true }, orderBy: { createdAt: 'desc' }});
  }

  async create(dto: CreateOpportunityDto) {
    const data: any = {
      ownerId: dto.ownerId, stageId: dto.stageId, leadId: dto.leadId ?? null,
      legalName: dto.legalName ?? '', cnpj: dto.cnpj ?? '', address: dto.address ?? '',
      subdomain: dto.subdomain ?? '', users: dto.users ?? 0, whatsapp: dto.whatsapp ?? 0,
      instagram: dto.instagram ?? 0, facebook: dto.facebook ?? 0, waba: dto.waba ?? 0,
      hostingId: dto.hostingId ?? null, serverIp: dto.serverIp ?? null,
      trialStart: dto.trialStart ? new Date(dto.trialStart) : null,
      activation: dto.activation ? new Date(dto.activation) : null,
      billingBaseDay: dto.billingBaseDay ?? null,
    };
    const opp = await this.db.opportunity.create({ data, include: { owner: true, stage: true, lead: true } });

    if (data.trialStart) {
      const start = new Date(data.trialStart as Date).getTime();
      const end = start + 7 * 24 * 60 * 60 * 1000;
      const d5 = end - 5 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      await this.worker.enqueue('trial', 'trial-d-5', { oppId: opp.id }, Math.max(d5 - now, 0));
      await this.worker.enqueue('trial', 'trial-end', { oppId: opp.id }, Math.max(end - now, 0));
    }
    return opp;
  }

  async updateStage(id: string, dto: UpdateOppStageDto) {
    const opp = await this.db.opportunity.update({
      where: { id }, data: { stageId: dto.stageId }, include: { owner: true, stage: true, lead: true },
    });
    if (dto.actorId || dto.note) {
      await this.db.oppHistory.create({
        data: { oppId: id, actorId: dto.actorId ?? opp.ownerId, note: dto.note ?? `Stage changed to ${opp.stage.name}` },
      });
    }
    return opp;
  }

  async applyPricing(id: string, dto: ApplyPricingDto) {
    const subtotal = (dto.items ?? []).reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
    const discount = dto.discountPct ? subtotal * (dto.discountPct / 100) : 0;
    const total = Math.max(subtotal - discount, 0);
    const opp = await this.db.opportunity.update({
      where: { id }, data: { priceTotal: total }, include: { owner: true, stage: true, lead: true },
    });
    await this.db.oppHistory.create({
      data: { oppId: id, actorId: opp.ownerId, note: `Pricing applied: total ${total.toFixed(2)}` },
    });
    return opp;
  }

  async markLost(id: string, dto: MarkOpportunityLostDto) {
    const lost = await this.db.opportunityStage.findFirst({
      where: { OR: [{ name: 'Venda Perdida' }, { lostReasonRequired: true }] },
      orderBy: { lostReasonRequired: 'desc' },
    });
    const opp = await this.db.opportunity.update({
      where: { id }, data: { stageId: lost ? lost.id : undefined }, include: { owner: true, stage: true, lead: true },
    });
    await this.db.oppHistory.create({
      data: { oppId: id, actorId: dto.actorId ?? opp.ownerId, note: `Opportunity lost${dto.reason ? `: ${dto.reason}` : ''}${dto.summary ? ` — ${dto.summary}` : ''}` },
    });
    return opp;
  }
}
