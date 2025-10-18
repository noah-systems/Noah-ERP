import { Prisma } from '@prisma/client';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';

const cancellationSelect = {
  id: true,
  leadId: true,
  opportunityId: true,
  reason: true,
  requestedBy: true,
  effectiveDate: true,
  createdAt: true,
  lead: {
    select: {
      id: true,
      name: true,
      company: true,
    },
  },
  opportunity: {
    select: {
      id: true,
      title: true,
      stage: true,
    },
  },
} satisfies Prisma.CancellationSelect;

const createSchema = z.object({
  leadId: z.string().optional(),
  opportunityId: z.string().optional(),
  reason: z.string().min(1),
  requestedBy: z.string().optional(),
  effectiveDate: z.coerce.date().optional(),
});

export const listCancellations: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.cancellation.findMany({
      orderBy: { createdAt: 'desc' },
      select: cancellationSelect,
    });
    return res.json(items);
  } catch (error) {
    return next(error);
  }
};

export const createCancellation: RequestHandler = async (req, res, next) => {
  try {
    const data = await createSchema.parseAsync(req.body);
    const cancellation = await prisma.cancellation.create({
      data,
      select: cancellationSelect,
    });
    return res.status(201).json(cancellation);
  } catch (error) {
    return next(error);
  }
};
