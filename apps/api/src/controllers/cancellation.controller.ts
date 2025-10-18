import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

const createSchema = z
  .object({
    leadId: z.string().cuid().optional(),
    opportunityId: z.string().cuid().optional(),
    reason: z.string().min(1),
    details: z.string().optional(),
    cancelledAt: z.coerce.date().optional(),
  })
  .refine((data) => data.leadId || data.opportunityId, {
    message: 'Informe um lead ou oportunidade.',
    path: ['leadId'],
  });

const includeCancellation = {
  lead: {
    select: {
      id: true,
      companyName: true,
      stage: true,
    },
  },
  opportunity: {
    select: {
      id: true,
      name: true,
      stage: true,
    },
  },
} satisfies Prisma.CancellationInclude;

type CancellationWithRelations = Prisma.CancellationGetPayload<{ include: typeof includeCancellation }>;

function serializeCancellation(cancellation: CancellationWithRelations) {
  return {
    id: cancellation.id,
    reason: cancellation.reason,
    details: cancellation.details,
    cancelledAt: cancellation.cancelledAt,
    createdAt: cancellation.createdAt,
    updatedAt: cancellation.updatedAt,
    lead: cancellation.lead,
    opportunity: cancellation.opportunity,
  };
}

export const listCancellations = asyncHandler(async (_req: Request, res: Response) => {
  const cancellations = await prisma.cancellation.findMany({
    orderBy: { cancelledAt: 'desc' },
    include: includeCancellation,
  });

  return res.json(cancellations.map(serializeCancellation));
});

export const createCancellation = asyncHandler(async (req: Request, res: Response) => {
  const data = createSchema.parse(req.body);

  if (data.leadId) {
    const leadExists = await prisma.lead.findUnique({ where: { id: data.leadId } });
    if (!leadExists) {
      throw new AppError(404, 'Lead não encontrado.');
    }
  }

  if (data.opportunityId) {
    const oppExists = await prisma.opportunity.findUnique({ where: { id: data.opportunityId } });
    if (!oppExists) {
      throw new AppError(404, 'Oportunidade não encontrada.');
    }
  }

  const cancellation = await prisma.cancellation.create({
    data: {
      leadId: data.leadId,
      opportunityId: data.opportunityId,
      reason: data.reason,
      details: data.details,
      cancelledAt: data.cancelledAt ?? new Date(),
    },
    include: includeCancellation,
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user?.id,
      entityType: 'cancellation',
      entityId: cancellation.id,
      action: 'create',
      description: 'Registro de cancelamento criado',
      leadId: cancellation.leadId ?? undefined,
      opportunityId: cancellation.opportunityId ?? undefined,
    },
  });

  return res.status(201).json(serializeCancellation(cancellation));
});
