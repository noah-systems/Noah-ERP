/* eslint-disable no-console */
const { Pool } = require('pg');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL precisa estar definido para executar o seed.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function upsertAdmin({ name, email, password }) {
  const client = await pool.connect();
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const idResult = await client.query('SELECT "id" FROM "User" WHERE "email" = $1 LIMIT 1', [email]);
    const userId = idResult.rows[0]?.id || crypto.randomUUID();
    await client.query(
      `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ("email") DO UPDATE
       SET "name" = EXCLUDED."name",
           "passwordHash" = EXCLUDED."passwordHash",
           "role" = EXCLUDED."role",
           "updatedAt" = NOW()`,
      [userId, name, email, passwordHash, 'ADMIN_NOAH'],
    );
  } finally {
    client.release();
  }
}

async function upsertDashboardMetrics() {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO "DashboardMetrics" ("id") VALUES (1)
       ON CONFLICT ("id") DO NOTHING`,
    );
  } catch (error) {
    console.warn('Falha ao atualizar métricas padrão:', error.message);
  } finally {
    client.release();
  }
}

async function main() {
  const name = process.env.ADMIN_NAME || 'Admin Noah';
  const email = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
  const pass = process.env.ADMIN_PASSWORD || 'D2W3£Qx!0Du#';
  await upsertAdmin({ name, email, password: pass });
  await upsertDashboardMetrics();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end().catch(() => {});
  });
