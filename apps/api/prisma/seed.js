/* eslint-disable @typescript-eslint/no-var-requires, no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

/**
 * Seed tolerante a esquemas:
 * - tenta salvar em 'passwordHash'; se falhar, tenta 'password'
 * - tenta aplicar 'role: ADMIN_NOAH'; se falhar (campo inexistente), ignora
 */
async function upsertAdmin({ name, email, plainPassword }) {
  const hash = await bcrypt.hash(plainPassword, 10);
  const base = { email, name };

  // Tentativa 1: passwordHash + role
  try {
    await prisma.user.upsert({
      where: { email },
      update: { ...base, passwordHash: hash, role: 'ADMIN_NOAH' },
      create: { ...base, passwordHash: hash, role: 'ADMIN_NOAH' },
    });
    return { variant: 'passwordHash+role' };
  } catch (_) {}

  // Tentativa 2: passwordHash sem role
  try {
    await prisma.user.upsert({
      where: { email },
      update: { ...base, passwordHash: hash },
      create: { ...base, passwordHash: hash },
    });
    return { variant: 'passwordHash' };
  } catch (_) {}

  // Tentativa 3: password + role
  try {
    await prisma.user.upsert({
      where: { email },
      update: { ...base, password: hash, role: 'ADMIN_NOAH' },
      create: { ...base, password: hash, role: 'ADMIN_NOAH' },
    });
    return { variant: 'password+role' };
  } catch (_) {}

  // Tentativa 4: password sem role
  await prisma.user.upsert({
    where: { email },
    update: { ...base, password: hash },
    create: { ...base, password: hash },
  });
  return { variant: 'password' };
}

async function main() {
  const name = process.env.ADMIN_NAME || 'Admin Noah';
  const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
  const password = process.env.ADMIN_PASSWORD || 'change-me-now';

  const res = await upsertAdmin({ name, email, plainPassword: password });
  console.log(`Seed admin OK (${res.variant}): ${email}`);
}

main().catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
