/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertAdmin({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name, email, passwordHash, role: 'ADMIN_NOAH' },
    create: { name, email, passwordHash, role: 'ADMIN_NOAH' },
  });
}

async function main() {
  const name = process.env.ADMIN_NAME || 'Admin Noah';
  const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
  const pass = process.env.ADMIN_PASSWORD || 'D2W3£Qx!0Du#';
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
