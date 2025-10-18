import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import { prisma } from '../lib/prisma';
import { config } from '../lib/config';
import { AppError } from '../utils/app-error';

interface TokenPayload extends JwtPayload {
  sub: string;
  sessionId: string;
  jti: string;
  name: string;
  email: string;
  role: string;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.get('authorization');
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return next(new AppError(401, 'Credenciais inválidas.'));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new AppError(401, 'Credenciais inválidas.'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    if (!payload.sub || !payload.sessionId || !payload.jti) {
      throw new AppError(401, 'Token inválido.');
    }

    const session = await prisma.session.findUnique({ where: { tokenId: payload.jti } });
    if (!session || session.userId !== payload.sub) {
      throw new AppError(401, 'Sessão expirada.');
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
      throw new AppError(401, 'Sessão expirada.');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new AppError(401, 'Usuário não encontrado.');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionId: payload.sessionId,
      tokenId: payload.jti,
    };
    req.tokenId = payload.jti;

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(401, 'Não autorizado.'));
  }
}
