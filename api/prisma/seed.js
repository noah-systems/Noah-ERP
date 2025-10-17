import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_NAME = process.env.ADMIN_NAME || "Admin Noah";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@noahomni.com.br";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "D2W3£Qx!0Du#";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        passwordHash,
        role: "ADMIN_NOAH"
      }
    });
    console.log("Seed: admin user created:", ADMIN_EMAIL);
  } else {
    if (existing.role !== "ADMIN_NOAH") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN_NOAH" }
      });
      console.log("Seed: admin user role aligned for:", ADMIN_EMAIL);
    } else {
      console.log("Seed: admin user already exists:", ADMIN_EMAIL);
    }
  }

  await prisma.dashboardMetrics.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
  console.log("Seed: dashboard metrics baseline ensured (id=1)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
