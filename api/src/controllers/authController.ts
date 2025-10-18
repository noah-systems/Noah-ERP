import crypto from 'node:crypto';
import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { HttpError } from '../utils/httpError';
import type { AuthenticatedUser } from '../types/auth';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

const SESSION_TTL_HOURS = 12;

const serializeUser = (user: AuthenticatedUser | { id: string; email: string; name: string; role: string }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

const createJwt = (sessionToken: string, userId: string) =>
  jwt.sign({ sub: userId, sid: sessionToken }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = await loginSchema.parseAsync(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, 'invalid_credentials');
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new HttpError(401, 'invalid_credentials');
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt,
      },
    });

    const jwtToken = createJwt(sessionToken, user.id);
    const payload = serializeUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res.json({ token: jwtToken, user: payload });
  } catch (error) {
    return next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, 'unauthorized'));
  }

  try {
    await prisma.session.delete({ where: { token: req.user.sessionToken } }).catch(() => undefined);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  if (!req.user) {
    return next(new HttpError(401, 'unauthorized'));
  }

  try {
    const freshUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!freshUser) {
      await prisma.session.delete({ where: { token: req.user.sessionToken } }).catch(() => undefined);
      throw new HttpError(401, 'unauthorized');
    }

    return res.json({ user: serializeUser({
      id: freshUser.id,
      email: freshUser.email,
      name: freshUser.name,
      role: freshUser.role,
    }) });
  } catch (error) {
    return next(error);
  }
};
