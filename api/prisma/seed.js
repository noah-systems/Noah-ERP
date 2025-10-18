/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
    const rawPassword = process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || 'D2W3£Qx!0Du#';
    const name = process.env.ADMIN_NAME || 'Administrador Noah';

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: 'ADMIN',
        name,
      },
      create: {
        email,
        passwordHash,
        role: 'ADMIN',
        name,
      },
    });

    console.log('[seed] admin ok:', admin.email);
  } catch (error) {
    console.error('[seed] erro', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
