/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertAdmin({ name, email, password }) {
  const hash = await bcrypt.hash(password, 10);
  const base = { email, name };
  // tenta variantes: passwordHash+role, passwordHash, password+role, password
  try {
    await prisma.user.upsert({
      where: { email },
      update: { ...base, passwordHash: hash, role: 'ADMIN_NOAH' },
      create: { ...base, passwordHash: hash, role: 'ADMIN_NOAH' },
    });
    return;
  } catch {}
  try {
    await prisma.user.upsert({
      where: { email },
      update: { ...base, passwordHash: hash },
      create: { ...base, passwordHash: hash },
    });
    return;
  } catch {}
  try {
    await prisma.user.upsert({
      where: { email },
      update: { ...base, password: hash, role: 'ADMIN_NOAH' },
      create: { ...base, password: hash, role: 'ADMIN_NOAH' },
    });
    return;
  } catch {}
  await prisma.user.upsert({
    where: { email },
    update: { ...base, password: hash },
    create: { ...base, password: hash },
  });
}

async function main() {
  const name = process.env.ADMIN_NAME || 'Admin Noah';
  const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
  const pass = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  await upsertAdmin({ name, email, password: pass });
  try {
    await prisma.dashboardMetrics.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
  } catch {}
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
