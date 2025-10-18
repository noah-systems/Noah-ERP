import type { Request, Response } from 'express';
import { OpportunityStage } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

const baseSchema = z.object({
  name: z.string().min(1),
  value: z.coerce.number().nonnegative().optional(),
  contactName: z.string().optional(),
  leadId: z.string().cuid().optional(),
  modules: z.array(z.string()).optional(),
  trialEndsAt: z.coerce.date().optional(),
  workspaceSlug: z.string().optional(),
  stage: z.nativeEnum(OpportunityStage).optional(),
});

const updateSchema = baseSchema.partial();

const moveSchema = z.object({
  stage: z.nativeEnum(OpportunityStage),
  position: z.coerce.number().int().nonnegative(),
});

const idSchema = z.object({ id: z.string().cuid() });

const includeOpportunity = {
  owner: { select: { id: true, name: true, email: true } },
  lead: {
    select: {
      id: true,
      companyName: true,
      stage: true,
    },
  },
  implementation: true,
} satisfies Prisma.OpportunityInclude;

type OpportunityWithRelations = Prisma.OpportunityGetPayload<{ include: typeof includeOpportunity }>;

function serializeOpportunity(opportunity: OpportunityWithRelations) {
  return {
    id: opportunity.id,
    name: opportunity.name,
    value: opportunity.value ? Number(opportunity.value) : null,
    contactName: opportunity.contactName,
    lead: opportunity.lead,
    owner: opportunity.owner,
    modules: opportunity.modules ?? [],
    stage: opportunity.stage,
    order: opportunity.order,
    trialEndsAt: opportunity.trialEndsAt,
    workspaceSlug: opportunity.workspaceSlug,
    implementation: opportunity.implementation,
    createdAt: opportunity.createdAt,
    updatedAt: opportunity.updatedAt,
  };
}

export const listOpportunities = asyncHandler(async (_req: Request, res: Response) => {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: [
      { stage: 'asc' },
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
    include: includeOpportunity,
  });

  return res.json(opportunities.map(serializeOpportunity));
});

export const createOpportunity = asyncHandler(async (req: Request, res: Response) => {
  const body = baseSchema.parse(req.body);
  const stage = body.stage ?? OpportunityStage.NEGOCIACAO;

  const maxOrder = await prisma.opportunity.aggregate({
    where: { stage },
    _max: { order: true },
  });

  const opportunity = await prisma.opportunity.create({
    data: {
      name: body.name,
      value: body.value,
      contactName: body.contactName,
      leadId: body.leadId,
      modules: body.modules ?? [],
      trialEndsAt: body.trialEndsAt,
      workspaceSlug: body.workspaceSlug,
      ownerId: req.user?.id,
      stage,
      order: (maxOrder._max.order ?? -1) + 1,
    },
    include: includeOpportunity,
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user?.id,
      entityType: 'opportunity',
      entityId: opportunity.id,
      action: 'create',
      description: `Oportunidade ${opportunity.name} criada`,
      opportunityId: opportunity.id,
      leadId: opportunity.leadId,
    },
  });

  return res.status(201).json(serializeOpportunity(opportunity));
});

export const updateOpportunity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idSchema.parse(req.params);
  const data = updateSchema.parse(req.body);

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data,
    include: includeOpportunity,
  });

  return res.json(serializeOpportunity(opportunity));
});

export const deleteOpportunity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idSchema.parse(req.params);

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        entityType: 'opportunity',
        entityId: id,
        action: 'delete',
        description: 'Oportunidade removida',
        opportunityId: id,
      },
    }),
    prisma.opportunity.delete({ where: { id } }),
  ]);

  return res.status(204).send();
});

export const moveOpportunity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idSchema.parse(req.params);
  const { stage, position } = moveSchema.parse(req.body);

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    throw new AppError(404, 'Oportunidade não encontrada.');
  }

  await prisma.$transaction(async (tx) => {
    const sourceSiblings = await tx.opportunity.findMany({
      where: { stage: opportunity.stage, NOT: { id } },
      orderBy: { order: 'asc' },
    });

    await Promise.all(
      sourceSiblings.map((item, index) =>
        tx.opportunity.update({ where: { id: item.id }, data: { order: index } })
      )
    );

    const targetSiblings = await tx.opportunity.findMany({
      where: { stage, NOT: { id } },
      orderBy: { order: 'asc' },
    });

    const clampedPosition = Math.min(Math.max(position, 0), targetSiblings.length);

    await Promise.all(
      targetSiblings.map((item, index) =>
        tx.opportunity.update({
          where: { id: item.id },
          data: { order: index >= clampedPosition ? index + 1 : index },
        })
      )
    );

    await tx.opportunity.update({
      where: { id },
      data: { stage, order: clampedPosition },
    });

    await tx.activityLog.create({
      data: {
        userId: req.user?.id,
        entityType: 'opportunity',
        entityId: id,
        action: 'move',
        description: `Oportunidade movida para ${stage}`,
        opportunityId: id,
      },
    });
  });

  const updated = await prisma.opportunity.findUnique({ where: { id }, include: includeOpportunity });
  if (!updated) {
    throw new AppError(404, 'Oportunidade não encontrada.');
  }

  return res.json(serializeOpportunity(updated));
});
