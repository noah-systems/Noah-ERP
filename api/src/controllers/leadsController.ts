import { LeadStage, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/httpError';

const leadPayload = {
  id: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  stage: true,
  order: true,
  value: true,
  source: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LeadSelect;

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  value: z.number().finite().nonnegative().optional(),
  stage: z.nativeEnum(LeadStage).optional(),
});

const updateLeadSchema = createLeadSchema.partial();

const moveLeadSchema = z.object({
  stage: z.nativeEnum(LeadStage),
  position: z.number().int().nonnegative().optional().default(0),
});

const listQuerySchema = z
  .object({
    stage: z.nativeEnum(LeadStage).optional(),
  })
  .partial();

export const listLeads: RequestHandler = async (req, res, next) => {
  try {
    const { stage } = await listQuerySchema.parseAsync(req.query);
    const leads = await prisma.lead.findMany({
      where: { stage },
      orderBy: [{ stage: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
      select: leadPayload,
    });
    return res.json(leads);
  } catch (error) {
    return next(error);
  }
};

type LeadAggregateClient = {
  lead: {
    aggregate: typeof prisma.lead.aggregate;
  };
};

async function nextOrder(client: LeadAggregateClient, stage: LeadStage) {
  const aggregate = await client.lead.aggregate({
    where: { stage },
    _max: { order: true },
  });
  return (aggregate._max.order ?? -1) + 1;
}

export const createLead: RequestHandler = async (req, res, next) => {
  try {
    const payload = await createLeadSchema.parseAsync(req.body);
    const stage = payload.stage ?? LeadStage.NUTRICAO;

    const lead = await prisma.lead.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
        source: payload.source,
        value: payload.value !== undefined ? new Prisma.Decimal(payload.value) : undefined,
        stage,
        order: await nextOrder(prisma, stage),
        ownerId: req.user?.id,
      },
      select: leadPayload,
    });

    return res.status(201).json(lead);
  } catch (error) {
    return next(error);
  }
};

export const updateLead: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await updateLeadSchema.parseAsync(req.body);

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new HttpError(404, 'lead_not_found');
    }

    const value = data.value !== undefined ? new Prisma.Decimal(data.value) : undefined;

    if (data.stage && data.stage !== lead.stage) {
      const result = await prisma.$transaction(async (tx) => {
        const order = await nextOrder(tx, data.stage!);
        const updated = await tx.lead.update({
          where: { id },
          data: {
            ...data,
            value,
            stage: data.stage!,
            order,
          },
          select: leadPayload,
        });

        await resequenceStage(tx, lead.stage);
        return updated;
      });

      return res.json(result);
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        value,
      },
      select: leadPayload,
    });
    return res.json(updated);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(new HttpError(404, 'lead_not_found'));
    }
    return next(error);
  }
};

export const deleteLead: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.lead.delete({ where: { id }, select: { stage: true } });
      await resequenceStage(tx, deleted.stage);
    });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(new HttpError(404, 'lead_not_found'));
    }
    return next(error);
  }
};

async function resequenceStage(tx: Prisma.TransactionClient, stage: LeadStage) {
  const leads = await tx.lead.findMany({
    where: { stage },
    orderBy: { order: 'asc' },
    select: { id: true },
  });

  await Promise.all(
    leads.map((lead, index) =>
      tx.lead.update({ where: { id: lead.id }, data: { order: index } })
    )
  );
}

export const moveLead: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { stage, position } = await moveLeadSchema.parseAsync(req.body);
    const sanitizedPosition = Math.max(0, position);

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.lead.findUnique({ where: { id } });
      if (!current) {
        throw new HttpError(404, 'lead_not_found');
      }

      if (current.stage === stage) {
        const items = await tx.lead.findMany({
          where: { stage },
          orderBy: { order: 'asc' },
        });

        const others = items.filter((item) => item.id !== id);
        const bounded = Math.min(sanitizedPosition, others.length);
        others.splice(bounded, 0, current);

        await Promise.all(
          others.map((item, index) =>
            tx.lead.update({ where: { id: item.id }, data: { stage, order: index } })
          )
        );

        return tx.lead.findUnique({ where: { id }, select: leadPayload });
      }

      await tx.lead.update({ where: { id }, data: { stage } });
      await resequenceStage(tx, current.stage);

      const stageItems = await tx.lead.findMany({
        where: { stage },
        orderBy: { order: 'asc' },
      });

      const bounded = Math.min(sanitizedPosition, stageItems.length);
      await Promise.all(
        stageItems
          .map((item, index) => ({ item, index }))
          .map(({ item, index }) =>
            tx.lead.update({
              where: { id: item.id },
              data: { order: index >= bounded ? index + 1 : index },
            })
          )
      );

      await tx.lead.update({ where: { id }, data: { order: bounded } });

      return tx.lead.findUnique({ where: { id }, select: leadPayload });
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};
