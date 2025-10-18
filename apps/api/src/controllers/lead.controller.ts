import type { Request, Response } from 'express';
import { LeadStage } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

const leadBodySchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  segment: z.string().optional(),
  employees: z.coerce.number().int().nonnegative().optional(),
  origin: z.string().optional(),
  notes: z.string().optional(),
  stage: z.nativeEnum(LeadStage).optional(),
});

const leadUpdateSchema = leadBodySchema.partial();

const moveSchema = z.object({
  stage: z.nativeEnum(LeadStage),
  position: z.coerce.number().int().nonnegative(),
});

const leadIdSchema = z.object({ id: z.string().cuid() });

const includeLead = {
  owner: { select: { id: true, name: true, email: true } },
  opportunities: {
    select: {
      id: true,
      name: true,
      stage: true,
      value: true,
      createdAt: true,
    },
  },
} satisfies Prisma.LeadInclude;

type LeadWithRelations = Prisma.LeadGetPayload<{ include: typeof includeLead }>;

function serializeLead(lead: LeadWithRelations) {
  return {
    id: lead.id,
    companyName: lead.companyName,
    contactName: lead.contactName,
    contactEmail: lead.contactEmail,
    contactPhone: lead.contactPhone,
    segment: lead.segment,
    employees: lead.employees,
    origin: lead.origin,
    notes: lead.notes,
    stage: lead.stage,
    order: lead.order,
    owner: lead.owner,
    opportunities: lead.opportunities?.map((opportunity) => ({
      ...opportunity,
      value: opportunity.value ? Number(opportunity.value) : null,
    })),
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export const listLeads = asyncHandler(async (_req: Request, res: Response) => {
  const leads = await prisma.lead.findMany({
    orderBy: [
      { stage: 'asc' },
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
    include: includeLead,
  });

  return res.json(leads.map((lead) => serializeLead(lead)));
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const body = leadBodySchema.parse(req.body);
  const stage = body.stage ?? LeadStage.NUTRICAO;

  const maxOrder = await prisma.lead.aggregate({
    where: { stage },
    _max: { order: true },
  });

  const lead = await prisma.lead.create({
    data: {
      companyName: body.companyName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      segment: body.segment,
      employees: body.employees,
      origin: body.origin,
      notes: body.notes,
      stage,
      order: (maxOrder._max.order ?? -1) + 1,
      ownerId: req.user?.id,
    },
    include: includeLead,
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user?.id,
      entityType: 'lead',
      entityId: lead.id,
      action: 'create',
      description: `Lead ${lead.companyName} criado`,
      leadId: lead.id,
    },
  });

  return res.status(201).json(serializeLead(lead));
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = leadIdSchema.parse(req.params);
  const data = leadUpdateSchema.parse(req.body);

  const lead = await prisma.lead.update({
    where: { id },
    data,
    include: includeLead,
  });

  return res.json(serializeLead(lead));
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = leadIdSchema.parse(req.params);

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        entityType: 'lead',
        entityId: id,
        action: 'delete',
        description: 'Lead removido',
        leadId: id,
      },
    }),
    prisma.lead.delete({ where: { id } }),
  ]);

  return res.status(204).send();
});

export const moveLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = leadIdSchema.parse(req.params);
  const { stage, position } = moveSchema.parse(req.body);

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    throw new AppError(404, 'Lead não encontrado.');
  }

  await prisma.$transaction(async (tx) => {
    // Reordenar coluna de origem
    const siblingsFrom = await tx.lead.findMany({
      where: { stage: lead.stage, NOT: { id } },
      orderBy: { order: 'asc' },
    });

    await Promise.all(
      siblingsFrom.map((item, index) =>
        tx.lead.update({ where: { id: item.id }, data: { order: index } })
      )
    );

    const targetSiblings = await tx.lead.findMany({
      where: { stage, NOT: { id } },
      orderBy: { order: 'asc' },
    });

    const clampedPosition = Math.min(Math.max(position, 0), targetSiblings.length);

    await Promise.all(
      targetSiblings.map((item, index) =>
        tx.lead.update({
          where: { id: item.id },
          data: { order: index >= clampedPosition ? index + 1 : index },
        })
      )
    );

    await tx.lead.update({
      where: { id },
      data: { stage, order: clampedPosition },
    });

    await tx.activityLog.create({
      data: {
        userId: req.user?.id,
        entityType: 'lead',
        entityId: id,
        action: 'move',
        description: `Lead movido para ${stage}`,
        leadId: id,
      },
    });
  });

  const updated = await prisma.lead.findUnique({ where: { id }, include: includeLead });
  if (!updated) {
    throw new AppError(404, 'Lead não encontrado.');
  }
  return res.json(serializeLead(updated));
});
