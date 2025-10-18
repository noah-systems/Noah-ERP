import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma, type User } from '@prisma/client';

import prisma from './db';
import { auth } from './middleware/auth';

const app = express();
const router = express.Router();
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-please-32chars-min';

app.get('/ping', (_req, res) => {
  return res.status(200).json({ ok: true });
});

function sanitizeUser(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function handlePrismaError(error: unknown, res: express.Response) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return res.status(404).json({ error: 'Not found' });
  }
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}

router.get('/health', (_req, res) => res.status(200).json({ ok: true }));

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '12h',
    });

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.get('/auth/me', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const freshUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!freshUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: sanitizeUser(freshUser) });
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.get('/leads', auth, async (_req, res) => {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(leads);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.post('/leads', auth, async (req, res) => {
  try {
    const { name, email, phone, stage, source } = req.body ?? {};
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const data: Prisma.LeadCreateInput = {
      name,
      owner: req.user ? { connect: { id: req.user.id } } : undefined,
      email: email ?? null,
      phone: phone ?? null,
      stage,
      source,
    };

    const lead = await prisma.lead.create({ data });
    return res.status(201).json(lead);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.put('/leads/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, stage, source, ownerId } = req.body ?? {};

    const data: Prisma.LeadUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (stage !== undefined) data.stage = stage;
    if (source !== undefined) data.source = source;
    if (ownerId !== undefined) {
      data.owner = ownerId ? { connect: { id: ownerId } } : { disconnect: true };
    }

    const lead = await prisma.lead.update({ where: { id }, data });
    return res.json(lead);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.delete('/leads/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.put('/leads/:id/move', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body ?? {};
    if (!stage) {
      return res.status(400).json({ error: 'stage is required' });
    }

    const lead = await prisma.lead.update({ where: { id }, data: { stage } });
    return res.json(lead);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.get('/opportunities', auth, async (_req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lead: true },
    });
    return res.json(opportunities);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.post('/opportunities', auth, async (req, res) => {
  try {
    const { title, value, stage, leadId } = req.body ?? {};
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const data: Prisma.OpportunityCreateInput = {
      title,
      value: value !== undefined ? Number(value) : undefined,
      stage,
      lead: leadId ? { connect: { id: leadId } } : undefined,
      owner: req.user ? { connect: { id: req.user.id } } : undefined,
    };

    const opportunity = await prisma.opportunity.create({
      data,
      include: { lead: true },
    });
    return res.status(201).json(opportunity);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.put('/opportunities/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value, stage, leadId, ownerId } = req.body ?? {};

    const data: Prisma.OpportunityUpdateInput = {};
    if (title !== undefined) data.title = title;
    if (value !== undefined) data.value = Number(value);
    if (stage !== undefined) data.stage = stage;
    if (leadId !== undefined) {
      data.lead = leadId ? { connect: { id: leadId } } : { disconnect: true };
    }
    if (ownerId !== undefined) {
      data.owner = ownerId ? { connect: { id: ownerId } } : { disconnect: true };
    }

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data,
      include: { lead: true },
    });
    return res.json(opportunity);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.delete('/opportunities/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.opportunity.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

router.put('/opportunities/:id/move', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body ?? {};
    if (!stage) {
      return res.status(400).json({ error: 'stage is required' });
    }

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: { stage },
      include: { lead: true },
    });
    return res.json(opportunity);
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

app.use('/api', router);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  return handlePrismaError(err, res);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Noah API listening on port ${PORT}`);
});
