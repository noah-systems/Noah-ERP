const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-please-32chars-min";

app.use(express.json());
app.use(cors());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

function sign(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "unauthorized" });
  }
}

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "missing credentials" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  return res.json({
    token: sign(user),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) {
    return res.status(404).json({ error: "not found" });
  }
  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

app.get("/api/leads", auth, async (_req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(leads);
});

app.post("/api/leads", auth, async (req, res) => {
  const { name, email, phone, stage, source } = req.body || {};
  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      stage,
      source,
      ownerId: req.user.sub,
    },
  });
  return res.status(201).json(lead);
});

app.put("/api/leads/:id/move", auth, async (req, res) => {
  const { stage } = req.body || {};
  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { stage },
  });
  return res.json(lead);
});

app.get("/api/opportunities", auth, async (_req, res) => {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res.json(opportunities);
});

app.post("/api/opportunities", auth, async (req, res) => {
  const { title, value, stage, leadId } = req.body || {};
  const opportunity = await prisma.opportunity.create({
    data: {
      title,
      value: Number(value || 0),
      stage,
      leadId,
      ownerId: req.user.sub,
    },
  });
  return res.status(201).json(opportunity);
});

app.put("/api/opportunities/:id/move", auth, async (req, res) => {
  const { stage } = req.body || {};
  const opportunity = await prisma.opportunity.update({
    where: { id: req.params.id },
    data: { stage },
  });
  return res.json(opportunity);
});

app.listen(PORT, () => {
  console.log(`Noah API listening on :${PORT}`);
});
