import type { Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  await prisma.$queryRaw`SELECT 1`;
  return res.json({ ok: true });
});
