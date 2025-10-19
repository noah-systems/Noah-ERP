/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME || 'Admin Noah';
  const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
  const password = process.env.ADMIN_PASSWORD || 'change-me-now';
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name, password: hash, role: 'ADMIN_NOAH' },
    create: { name, email, password: hash, role: 'ADMIN_NOAH' },
  });
}

main().catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
