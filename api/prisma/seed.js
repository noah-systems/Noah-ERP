require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@noahomni.com.br";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";
  const adminId = "seed-admin";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$executeRaw`
    INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "createdAt", "updatedAt")
    VALUES (${adminId}, ${email}, ${name}, ${passwordHash}, 'ADMIN', NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET
      "name" = EXCLUDED."name",
      "passwordHash" = EXCLUDED."passwordHash",
      "role" = 'ADMIN',
      "updatedAt" = NOW()
  `;

  const admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    throw new Error("Admin upsert failed");
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO "Lead" ("id", "name", "email", "phone", "stage", "source", "ownerId", "createdAt", "updatedAt")
      VALUES ('seed-lead-default', 'Lead Exemplo', 'lead@exemplo.com', '0000-0000', 'NUTRICAO', 'MANUAL', ${admin.id}, NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING
    `;
  } catch (error) {
    console.warn("Skipping demo lead insert:", error.message);
  }

  console.log("Seed completed with admin:", email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
