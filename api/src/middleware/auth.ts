import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { HttpError } from '../utils/httpError';
import type { AuthenticatedUser } from '../types/auth';

type JwtPayload = {
  sub: string;
  sid: string;
  exp: number;
  iat: number;
};

async function resolveSession(sessionToken: string): Promise<AuthenticatedUser> {
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || !session.user) {
    throw new HttpError(401, 'unauthorized');
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { token: sessionToken } }).catch(() => undefined);
    throw new HttpError(401, 'session_expired');
  }

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sessionToken: sessionToken,
  };
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'unauthorized'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new HttpError(401, 'unauthorized'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!payload.sid) {
      return next(new HttpError(401, 'invalid_token'));
    }

    const user = await resolveSession(payload.sid);
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new HttpError(401, 'token_expired'));
    }
    return next(new HttpError(401, 'unauthorized'));
  }
};
