const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@noahomni.com.br';
  const rawPassword = process.env.SEED_ADMIN_PASS || 'troque-esta-senha';
  const name = process.env.SEED_ADMIN_NAME || 'Administrador';
  const role = process.env.SEED_ADMIN_ROLE || 'ADMIN';

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] admin já existe: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
    },
  });

  console.log(`[seed] admin criado: ${email}`);
}

main()
  .catch((error) => {
    console.error('[seed] erro ao criar admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
