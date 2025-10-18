import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import crypto from 'node:crypto';

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });
import express from 'express';
import cors from 'cors';

const prisma = new PrismaClient();

const app = express();

const PORT = process.env.PORT || 3000;
const COOKIE_NAME = 'noah_token';
const COOKIE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || process.env.SESSION_SECRET || 'change-me';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin Noah';
const DEFAULT_ROLE = 'ADMIN_NOAH';

const corsOrigins = (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim());
app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins, credentials: true }));

app.use(express.json());

const toBase64Url = (value) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const fromBase64Url = (value) => {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  const normalized = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64').toString('utf8');
};

const signValue = (value) =>
  crypto.createHmac('sha256', COOKIE_SECRET).update(value).digest('base64url');

const signCookieValue = (value) => `s:${value}.${signValue(value)}`;

const verifySignedCookie = (signed) => {
  if (!signed || !signed.startsWith('s:')) return null;
  const payload = signed.slice(2);
  const separatorIndex = payload.lastIndexOf('.');
  if (separatorIndex <= 0) return null;
  const raw = payload.slice(0, separatorIndex);
  const signature = payload.slice(separatorIndex + 1);
  const expected = signValue(raw);
  const providedBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null;
  return raw;
};

const parseCookies = (header = '') => {
  const cookies = Object.create(null);
  header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const eqIndex = part.indexOf('=');
      if (eqIndex === -1) return;
      const key = part.slice(0, eqIndex).trim();
      const value = part.slice(eqIndex + 1).trim();
      cookies[key] = value;
    });
  return cookies;
};

const readSession = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const signed = cookies[COOKIE_NAME];
  if (!signed) return null;
  const raw = verifySignedCookie(signed);
  if (!raw) return null;
  try {
    const decoded = JSON.parse(fromBase64Url(raw));
    if (!decoded || typeof decoded.email !== 'string') return null;
    return {
      email: decoded.email,
      id: typeof decoded.id === 'string' ? decoded.id : undefined,
      name: typeof decoded.name === 'string' ? decoded.name : undefined,
      role: typeof decoded.role === 'string' ? decoded.role : undefined,
    };
  } catch {
    return null;
  }
};

const sanitizeRole = (role) =>
  typeof role === 'string' && role.trim().length > 0 ? role : DEFAULT_ROLE;

const toSessionPayload = (user) => ({
  id: typeof user.id === 'string' ? user.id : undefined,
  email: user.email,
  name: user.name ?? user.email.split('@')[0] ?? 'Usuário',
  role: sanitizeRole(user.role),
});

const encodeSession = (payload) => {
  const value = toBase64Url(JSON.stringify(payload));
  return signCookieValue(value);
};

const sharedCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: COOKIE_MAX_AGE_MS,
  path: '/',
};

const clearAuthCookie = (res) => {
  res.cookie(COOKIE_NAME, '', { ...sharedCookieOptions, maxAge: 0 });
};

const ensureMetrics = async () =>
  prisma.dashboardMetrics.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

const toDashboardPayload = (metrics) => ({
  leads: metrics.leads,
  opportunities: metrics.opportunities,
  implementacao: metrics.implantacao,
  canceladas: metrics.canceladas,
});

const buildHealthPayload = () => {
  const ts = new Date().toISOString();
  return {
    status: 'ok',
    uptime: process.uptime(),
    ts,
    timestamp: ts,
  };
};

const healthHandler = (_req, res) => {
  res.status(200).json(buildHealthPayload());
};

app.get('/health', healthHandler);

const apiRouter = express.Router();

apiRouter.get('/health', healthHandler);

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const findUserBySession = async (session) => {
  if (!session) return null;

  if (session.id) {
    const userById = await prisma.user.findUnique({ where: { id: session.id } });
    if (userById) {
      return toSessionPayload(userById);
    }
  }

  if (session.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: session.email } });
    if (userByEmail) {
      return toSessionPayload(userByEmail);
    }
  }

  if (ADMIN_EMAIL && session.email === ADMIN_EMAIL) {
    return {
      email: ADMIN_EMAIL,
      name: session.name ?? ADMIN_NAME,
      role: sanitizeRole(session.role),
    };
  }

  if (session.email) {
    return {
      email: session.email,
      name: session.name ?? session.email.split('@')[0] ?? 'Usuário',
      role: sanitizeRole(session.role),
    };
  }

  return null;
};

const requireAuthenticatedSession = async (req, res) => {
  const session = readSession(req);
  if (!session) {
    clearAuthCookie(res);
    res.status(401).json({ error: 'unauthenticated' });
    return null;
  }

  const user = await findUserBySession(session);
  if (!user) {
    clearAuthCookie(res);
    res.status(401).json({ error: 'unauthenticated' });
    return null;
  }

  return user;
};

apiRouter.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ authenticated: false, error: 'missing-credentials' });
    }

    const normalizedEmail = String(email).trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user) {
      const ok = await bcrypt.compare(String(password), user.passwordHash);
      if (!ok) {
        clearAuthCookie(res);
        return res.status(401).json({ authenticated: false });
      }
      const sessionPayload = toSessionPayload(user);
      const signedValue = encodeSession(sessionPayload);
      res.cookie(COOKIE_NAME, signedValue, sharedCookieOptions);
      return res.json({ authenticated: true, user: sessionPayload });
    }

    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      if (
        normalizedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        String(password) === ADMIN_PASSWORD
      ) {
        const sessionPayload = {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          role: DEFAULT_ROLE,
        };
        const signedValue = encodeSession(sessionPayload);
        res.cookie(COOKIE_NAME, signedValue, sharedCookieOptions);
        return res.json({ authenticated: true, user: sessionPayload });
      }
    }

    clearAuthCookie(res);
    return res.status(401).json({ authenticated: false });
  }),
);

apiRouter.post(
  '/auth/logout',
  asyncHandler(async (_req, res) => {
    clearAuthCookie(res);
    res.json({ authenticated: false });
  }),
);

apiRouter.get(
  '/auth/me',
  asyncHandler(async (req, res) => {
    const session = readSession(req);
    if (!session) {
      return res.json({ authenticated: false });
    }

    const user = await findUserBySession(session);
    if (!user) {
      clearAuthCookie(res);
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, user });
  }),
);

apiRouter.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const metrics = await ensureMetrics();
    res.json(toDashboardPayload(metrics));
  }),
);

apiRouter.post(
  '/leads',
  asyncHandler(async (req, res) => {
    const user = await requireAuthenticatedSession(req, res);
    if (!user) return;

    const metrics = await prisma.dashboardMetrics.upsert({
      where: { id: 1 },
      create: { id: 1, leads: 1 },
      update: { leads: { increment: 1 } },
    });

    res.json(toDashboardPayload(metrics));
  }),
);

apiRouter.post(
  '/opportunities',
  asyncHandler(async (req, res) => {
    const user = await requireAuthenticatedSession(req, res);
    if (!user) return;

    const metrics = await prisma.dashboardMetrics.upsert({
      where: { id: 1 },
      create: { id: 1, opportunities: 1 },
      update: { opportunities: { increment: 1 } },
    });

    res.json(toDashboardPayload(metrics));
  }),
);

app.use('/api', apiRouter);

app.use((err, _req, res, _next) => {
  console.error('API error:', err);
  if (res.headersSent) {
    return;
  }
  res.status(500).json({ error: 'internal-error' });
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, () => {
  console.log(`Noah API listening on :${PORT}`);
});
