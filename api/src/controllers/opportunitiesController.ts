import { OpportunityStage, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/httpError';

const opportunitySelect = {
  id: true,
  title: true,
  value: true,
  stage: true,
  order: true,
  leadId: true,
  ownerId: true,
  expectedClose: true,
  createdAt: true,
  updatedAt: true,
  lead: {
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
    },
  },
} satisfies Prisma.OpportunitySelect;

const createOpportunitySchema = z.object({
  title: z.string().min(1),
  leadId: z.string().min(1),
  value: z.number().nonnegative().optional(),
  stage: z.nativeEnum(OpportunityStage).optional(),
  expectedClose: z.coerce.date().optional(),
});

const updateOpportunitySchema = createOpportunitySchema.partial();

const moveOpportunitySchema = z.object({
  stage: z.nativeEnum(OpportunityStage),
  position: z.number().int().nonnegative().optional().default(0),
});

const listOpportunitiesQuery = z.object({
  stage: z.nativeEnum(OpportunityStage).optional(),
  leadId: z.string().optional(),
});

type OpportunityAggregateClient = {
  opportunity: {
    aggregate: typeof prisma.opportunity.aggregate;
  };
};

async function nextOrder(client: OpportunityAggregateClient, stage: OpportunityStage) {
  const aggregate = await client.opportunity.aggregate({
    where: { stage },
    _max: { order: true },
  });
  return (aggregate._max.order ?? -1) + 1;
}

export const listOpportunities: RequestHandler = async (req, res, next) => {
  try {
    const { stage, leadId } = await listOpportunitiesQuery.parseAsync(req.query);
    const items = await prisma.opportunity.findMany({
      where: { stage, leadId },
      orderBy: [{ stage: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
      select: opportunitySelect,
    });
    return res.json(items);
  } catch (error) {
    return next(error);
  }
};

export const createOpportunity: RequestHandler = async (req, res, next) => {
  try {
    const data = await createOpportunitySchema.parseAsync(req.body);
    const stage = data.stage ?? OpportunityStage.NEGOCIACAO;

    const opportunity = await prisma.opportunity.create({
      data: {
        title: data.title,
        stage,
        leadId: data.leadId,
        expectedClose: data.expectedClose,
        value: data.value !== undefined ? new Prisma.Decimal(data.value) : undefined,
        order: await nextOrder(prisma, stage),
        ownerId: req.user?.id,
      },
      select: opportunitySelect,
    });

    return res.status(201).json(opportunity);
  } catch (error) {
    return next(error);
  }
};

export const updateOpportunity: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await updateOpportunitySchema.parseAsync(req.body);

    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      throw new HttpError(404, 'opportunity_not_found');
    }

    const value = data.value !== undefined ? new Prisma.Decimal(data.value) : undefined;

    if (data.stage && data.stage !== opportunity.stage) {
      const result = await prisma.$transaction(async (tx) => {
        const order = await nextOrder(tx, data.stage!);
        const updated = await tx.opportunity.update({
          where: { id },
          data: {
            ...data,
            value,
            stage: data.stage!,
            order,
          },
          select: opportunitySelect,
        });

        await resequenceStage(tx, opportunity.stage);
        return updated;
      });

      return res.json(result);
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        ...data,
        value,
      },
      select: opportunitySelect,
    });

    return res.json(updated);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(new HttpError(404, 'opportunity_not_found'));
    }
    return next(error);
  }
};

export const deleteOpportunity: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.opportunity.delete({ where: { id }, select: { stage: true } });
      await resequenceStage(tx, deleted.stage);
    });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(new HttpError(404, 'opportunity_not_found'));
    }
    return next(error);
  }
};

async function resequenceStage(tx: Prisma.TransactionClient, stage: OpportunityStage) {
  const items = await tx.opportunity.findMany({
    where: { stage },
    orderBy: { order: 'asc' },
    select: { id: true },
  });

  await Promise.all(
    items.map((item, index) => tx.opportunity.update({ where: { id: item.id }, data: { order: index } }))
  );
}

export const moveOpportunity: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { stage, position } = await moveOpportunitySchema.parseAsync(req.body);
    const sanitizedPosition = Math.max(0, position);

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.opportunity.findUnique({ where: { id } });
      if (!current) {
        throw new HttpError(404, 'opportunity_not_found');
      }

      if (current.stage === stage) {
        const items = await tx.opportunity.findMany({ where: { stage }, orderBy: { order: 'asc' } });
        const others = items.filter((item) => item.id !== id);
        const bounded = Math.min(sanitizedPosition, others.length);
        others.splice(bounded, 0, current);

        await Promise.all(
          others.map((item, index) =>
            tx.opportunity.update({ where: { id: item.id }, data: { stage, order: index } })
          )
        );

        return tx.opportunity.findUnique({ where: { id }, select: opportunitySelect });
      }

      await tx.opportunity.update({ where: { id }, data: { stage } });
      await resequenceStage(tx, current.stage);

      const stageItems = await tx.opportunity.findMany({ where: { stage }, orderBy: { order: 'asc' } });
      const bounded = Math.min(sanitizedPosition, stageItems.length);

      await Promise.all(
        stageItems.map((item, index) =>
          tx.opportunity.update({
            where: { id: item.id },
            data: { order: index >= bounded ? index + 1 : index },
          })
        )
      );

      await tx.opportunity.update({ where: { id }, data: { order: bounded } });
      return tx.opportunity.findUnique({ where: { id }, select: opportunitySelect });
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
};
