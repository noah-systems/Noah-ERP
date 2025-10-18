import type { Request, Response } from 'express';
import { ImplementationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

const createSchema = z.object({
  opportunityId: z.string().cuid(),
  scheduledFor: z.coerce.date(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  scheduledFor: z.coerce.date().optional(),
  status: z.nativeEnum(ImplementationStatus).optional(),
  notes: z.string().optional(),
  completedAt: z.coerce.date().optional(),
});

const idSchema = z.object({ id: z.string().cuid() });

const includeImplementation = {
  opportunity: {
    select: {
      id: true,
      name: true,
      stage: true,
      leadId: true,
      lead: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
        },
      },
    },
  },
} satisfies Prisma.ImplementationInclude;

type ImplementationWithRelations = Prisma.ImplementationGetPayload<{ include: typeof includeImplementation }>;

function serializeImplementation(implementation: ImplementationWithRelations) {
  return {
    id: implementation.id,
    opportunity: implementation.opportunity,
    scheduledFor: implementation.scheduledFor,
    status: implementation.status,
    notes: implementation.notes,
    completedAt: implementation.completedAt,
    createdAt: implementation.createdAt,
    updatedAt: implementation.updatedAt,
  };
}

export const listImplementations = asyncHandler(async (_req: Request, res: Response) => {
  const implementations = await prisma.implementation.findMany({
    orderBy: { scheduledFor: 'asc' },
    include: includeImplementation,
  });

  return res.json(implementations.map(serializeImplementation));
});

export const createImplementation = asyncHandler(async (req: Request, res: Response) => {
  const data = createSchema.parse(req.body);

  const opportunity = await prisma.opportunity.findUnique({ where: { id: data.opportunityId } });
  if (!opportunity) {
    throw new AppError(404, 'Oportunidade não encontrada.');
  }

  const implementation = await prisma.implementation.create({
    data: {
      opportunityId: data.opportunityId,
      scheduledFor: data.scheduledFor,
      notes: data.notes,
    },
    include: includeImplementation,
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user?.id,
      entityType: 'implementation',
      entityId: implementation.id,
      action: 'create',
      description: 'Implantação agendada',
      opportunityId: implementation.opportunityId,
      leadId: opportunity.leadId ?? undefined,
    },
  });

  return res.status(201).json(serializeImplementation(implementation));
});

export const updateImplementation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idSchema.parse(req.params);
  const data = updateSchema.parse(req.body);

  const implementation = await prisma.implementation.update({
    where: { id },
    data: {
      scheduledFor: data.scheduledFor,
      status: data.status,
      notes: data.notes,
      completedAt: data.completedAt,
    },
    include: includeImplementation,
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user?.id,
      entityType: 'implementation',
      entityId: id,
      action: 'update',
      description: `Implantação ${implementation.status.toLowerCase()}`,
      opportunityId: implementation.opportunityId,
      leadId: implementation.opportunity?.leadId ?? undefined,
    },
  });

  return res.json(serializeImplementation(implementation));
});
