import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { config } from '../lib/config';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Credenciais inválidas.');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Credenciais inválidas.');
  }

  const expiresAt = new Date(Date.now() + config.sessionTtlHours * 60 * 60 * 1000);
  const tokenId = randomUUID();

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenId,
      expiresAt,
    },
  });

  const token = jwt.sign(
    {
      sub: user.id,
      sessionId: session.id,
      jti: tokenId,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: `${config.sessionTtlHours}h` }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.sessionId) {
    throw new AppError(401, 'Não autorizado.');
  }

  const filters: Prisma.SessionWhereInput[] = [{ id: req.user.sessionId }];
  if (req.tokenId) {
    filters.push({ tokenId: req.tokenId });
  }

  await prisma.session.deleteMany({
    where: {
      OR: filters,
    },
  });

  return res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Não autorizado.');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.');
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});
