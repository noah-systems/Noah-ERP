import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const corsOrigins = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins, credentials: false }));

app.use(express.json());

app.get('/api/worker/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'db' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing-credentials' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid-credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid-credentials' });

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

app.get('/api/me', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const me = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!me) return res.status(404).json({ error: 'not-found' });
    res.json({ id: me.id, name: me.name, email: me.email, role: me.role });
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
});

app.listen(PORT, () => {
  console.log(`Noah API listening on :${PORT}`);
});
