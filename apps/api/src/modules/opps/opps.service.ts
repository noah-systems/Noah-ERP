import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Channel, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  ApplyPricingDto,
  CreateOpportunityDto,
  MarkOpportunityLostDto,
  UpdateOppStageDto,
} from './opps.dto';
import { WorkerService } from '../worker/worker.service';

@Injectable()
export class OppsService {
  constructor(
    private readonly db: PrismaService,
    private readonly worker: WorkerService,
  ) {}

  list() {
    return this.db.opportunity.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        stage: true,
        owner: { select: { id: true, name: true, email: true, role: true } },
        lead: true,
        hosting: true,
        history: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
  }

  async create(dto: CreateOpportunityDto) {
    let scheduleTrial: { id: string; trialStart: Date } | null = null;
    const created = await this.db.$transaction(async (tx) => {
      const [owner, stage] = await Promise.all([
        tx.user.findUnique({ where: { id: dto.ownerId } }),
        tx.opportunityStage.findUnique({ where: { id: dto.stageId } }),
      ]);
      if (!owner) throw new NotFoundException('owner');
      if (!stage) throw new NotFoundException('stage');
      if (dto.leadId) {
        const leadExists = await tx.lead.findUnique({ where: { id: dto.leadId } });
        if (!leadExists) throw new NotFoundException('lead');
      }
      if (dto.hostingId) {
        const hosting = await tx.hostingProvider.findUnique({ where: { id: dto.hostingId } });
        if (!hosting) throw new NotFoundException('hosting');
      }
      const modules = {
        campaign: dto.modules?.campaign ?? false,
        crm: dto.modules?.crm ?? false,
        voip: dto.modules?.voip ?? false,
        glpi: dto.modules?.glpi ?? false,
      };
      const isTrialStage = stage.name.toLowerCase() === 'trial';
      const trialStart = dto.trialStart
        ? new Date(dto.trialStart)
        : isTrialStage
        ? new Date()
        : undefined;
      const createdOpp = await tx.opportunity.create({
        data: {
          leadId: dto.leadId,
          ownerId: dto.ownerId,
          stageId: dto.stageId,
          legalName: dto.legalName,
          cnpj: dto.cnpj,
          address: dto.address,
          finEmail: dto.finEmail,
          finOwner: dto.finOwner,
          finPhone: dto.finPhone,
          contactEmail: dto.contactEmail,
          contactOwner: dto.contactOwner,
          contactPhone: dto.contactPhone,
          subdomain: dto.subdomain,
          users: dto.users,
          whatsapp: dto.whatsapp,
          instagram: dto.instagram,
          facebook: dto.facebook,
          waba: dto.waba,
          modules,
          hostingId: dto.hostingId,
          serverIp: dto.serverIp,
          trialStart,
          activation: dto.activation ? new Date(dto.activation) : undefined,
          billingBaseDay: dto.billingBaseDay,
        },
      });
      await tx.oppHistory.create({
        data: {
          oppId: createdOpp.id,
          actorId: dto.ownerId,
          fromStage: null,
          toStage: stage.id,
          note: 'Opportunity created',
        },
      });
      if (isTrialStage) {
        await tx.implementationTask.create({ data: { oppId: createdOpp.id } });
        scheduleTrial = {
          id: createdOpp.id,
          trialStart: trialStart ?? new Date(),
        };
      }
      return createdOpp;
    });
    if (scheduleTrial) {
      await this.worker.queueTrialLifecycle(scheduleTrial.id, scheduleTrial.trialStart);
    }
    return created;
  }

  async updateStage(id: string, dto: UpdateOppStageDto) {
    let scheduleTrial: { id: string; trialStart: Date } | null = null;
    const updated = await this.db.$transaction(async (tx) => {
      const opp = await tx.opportunity.findUnique({ where: { id }, include: { stage: true } });
      if (!opp) throw new NotFoundException('opportunity');
      const stage = await tx.opportunityStage.findUnique({ where: { id: dto.stageId } });
      if (!stage) throw new NotFoundException('stage');
      const isTrialStage = stage.name.toLowerCase() === 'trial';
      const data: Prisma.OpportunityUpdateInput = { stageId: stage.id };
      if (isTrialStage) {
        const trialStart = opp.trialStart ?? new Date();
        data.trialStart = trialStart;
        scheduleTrial = { id, trialStart };
      }
      const updatedOpp = await tx.opportunity.update({
        where: { id },
        data,
      });
      await tx.oppHistory.create({
        data: {
          oppId: id,
          actorId: dto.actorId,
          fromStage: opp.stageId,
          toStage: stage.id,
          note: dto.note,
        },
      });
      if (isTrialStage) {
        const existingTask = await tx.implementationTask.findFirst({ where: { oppId: id } });
        if (!existingTask) {
          await tx.implementationTask.create({
            data: {
              oppId: id,
            },
          });
        }
      }
      return updatedOpp;
    });
    if (scheduleTrial) {
      await this.worker.queueTrialLifecycle(scheduleTrial.id, scheduleTrial.trialStart);
    }
    return updated;
  }

  async applyPricing(id: string, dto: ApplyPricingDto) {
    return this.db.$transaction(async (tx) => {
      const opp = await tx.opportunity.findUnique({ where: { id } });
      if (!opp) throw new NotFoundException('opportunity');
      if (!dto.items.length) {
        throw new BadRequestException('items required');
      }
      const items = await tx.priceItem.findMany({
        where: { sku: { in: dto.items.map((i) => i.sku) } },
      });
      if (items.length !== dto.items.length) {
        throw new NotFoundException('price item');
      }
      let subtotal = 0;
      for (const item of dto.items) {
        const dbItem = items.find((it) => it.sku === item.sku)!;
        subtotal += Number(dbItem.price) * (item.quantity ?? 1);
      }
      let discountPct: number | null = null;
      let total = subtotal;
      if (dto.channel === Channel.WHITE_LABEL) {
        if (dto.discountPct && dto.discountPct > 0) {
          throw new BadRequestException('White label cannot receive discounts');
        }
        if (!dto.users || dto.users <= 0) {
          throw new BadRequestException('users required for white label pricing');
        }
        const tier = await tx.priceTier.findFirst({
          where: {
            channel: Channel.WHITE_LABEL,
            minUsers: { lte: dto.users },
            OR: [{ maxUsers: null }, { maxUsers: { gte: dto.users } }],
          },
          orderBy: { minUsers: 'asc' },
        });
        if (!tier) {
          throw new NotFoundException('price tier');
        }
        subtotal += Number(tier.pricePerUser) * dto.users;
        total = subtotal;
        discountPct = null;
      } else {
        if (dto.discountPct && dto.discountPct > 0) {
          if (!dto.role) {
            throw new BadRequestException('role required for discount');
          }
          const policy = await tx.discountPolicy.findUnique({ where: { role: dto.role } });
          if (!policy) {
            throw new BadRequestException('No discount policy for role');
          }
          if (dto.discountPct > Number(policy.maxPercent)) {
            throw new BadRequestException('Discount above policy limit');
          }
          discountPct = dto.discountPct;
          total = subtotal * (1 - discountPct / 100);
        }
      }
      return tx.opportunity.update({
        where: { id },
        data: {
          priceSubtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          discountPct: discountPct !== null ? new Prisma.Decimal(discountPct.toFixed(2)) : null,
          priceTotal: new Prisma.Decimal(total.toFixed(2)),
        },
      });
    });
  }

  async markLost(id: string, dto: MarkOpportunityLostDto) {
    return this.db.$transaction(async (tx) => {
      const opp = await tx.opportunity.findUnique({ where: { id } });
      if (!opp) throw new NotFoundException('opportunity');
      const lostStage = await tx.opportunityStage.findFirst({ where: { name: 'Venda Perdida' } });
      if (!lostStage) {
        throw new NotFoundException('lost stage');
      }
      const updated = await tx.opportunity.update({
        where: { id },
        data: { stageId: lostStage.id, canceledAt: new Date() },
      });
      await tx.oppHistory.create({
        data: {
          oppId: id,
          actorId: dto.actorId,
          fromStage: opp.stageId,
          toStage: lostStage.id,
          note: dto.summary,
        },
      });
      await tx.canceledSale.create({
        data: {
          oppId: id,
          reason: dto.reason,
          summary: dto.summary,
        },
      });
      return updated;
    });
  }
}
