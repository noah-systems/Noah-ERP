import { ImplementationStatus, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/httpError';

const implementationSelect = {
  id: true,
  opportunityId: true,
  scheduledAt: true,
  status: true,
  completedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  opportunity: {
    select: {
      id: true,
      title: true,
      leadId: true,
      stage: true,
    },
  },
} satisfies Prisma.ImplementationSelect;

const createSchema = z.object({
  opportunityId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  scheduledAt: z.coerce.date().optional(),
  status: z.nativeEnum(ImplementationStatus).optional(),
  notes: z.string().optional(),
  completedAt: z.coerce.date().optional(),
});

export const listImplementations: RequestHandler = async (_req, res, next) => {
  try {
    const items = await prisma.implementation.findMany({
      orderBy: { scheduledAt: 'asc' },
      select: implementationSelect,
    });
    return res.json(items);
  } catch (error) {
    return next(error);
  }
};

export const createImplementation: RequestHandler = async (req, res, next) => {
  try {
    const data = await createSchema.parseAsync(req.body);

    const implementation = await prisma.implementation.create({
      data: {
        opportunityId: data.opportunityId,
        scheduledAt: data.scheduledAt,
        notes: data.notes,
        status: ImplementationStatus.SCHEDULED,
      },
      select: implementationSelect,
    });

    return res.status(201).json(implementation);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return next(new HttpError(409, 'implementation_already_exists'));
    }
    return next(error);
  }
};

export const updateImplementation: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await updateSchema.parseAsync(req.body);

    const implementation = await prisma.implementation.update({
      where: { id },
      data,
      select: implementationSelect,
    });

    return res.json(implementation);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(new HttpError(404, 'implementation_not_found'));
    }
    return next(error);
  }
};
