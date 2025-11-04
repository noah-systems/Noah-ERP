#!/usr/bin/env node
import { Pool } from 'pg';
import crypto from 'node:crypto';

const API_BASE = process.env.QA_API_URL || process.env.API_BASE || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL precisa estar definido para executar o QA smoke.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const buildUrl = (path) => {
    if (/^https?:/i.test(path)) {
      return path;
    }
    const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  };

  const http = async (path, { method = 'GET', headers = {}, data } = {}) => {
    const init = { method, headers: { ...headers } };
    if (data !== undefined) {
      init.body = JSON.stringify(data);
      init.headers['content-type'] ??= 'application/json';
    }
    const response = await fetch(buildUrl(path), init);
    return response;
  };

  try {
    console.log(`QA Smoke :: API base ${API_BASE}`);

    const healthResponse = await http('/health');
    if (!healthResponse.ok) {
      throw new Error(`Healthcheck falhou: HTTP ${healthResponse.status}`);
    }
    const health = await healthResponse.json();
    if (!health?.ok || health.api !== 'up') {
      throw new Error(`Healthcheck inválido: ${JSON.stringify(health)}`);
    }
    console.log('✓ Healthcheck ok');

    const loginResponse = await http('/auth/login', {
      method: 'POST',
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: HTTP ${loginResponse.status}`);
    }
    const loginData = await loginResponse.json();
    const token = loginData?.token || loginData?.access_token;
    if (!token) {
      throw new Error('Token JWT não retornado pelo login.');
    }
    console.log('✓ Login ok');

    const meResponse = await http('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meResponse.ok) {
      throw new Error(`/auth/me falhou: HTTP ${meResponse.status}`);
    }
    const meData = await meResponse.json();
    const user = meData?.user || meData;
    if (!user?.id) {
      throw new Error('Resposta de /auth/me inválida.');
    }
    console.log('✓ Token validado com /auth/me');

    const client = await pool.connect();
    try {
      const { rows: userRows } = await client.query(
        'SELECT "id" FROM "User" WHERE "email" = $1 LIMIT 1',
        [ADMIN_EMAIL],
      );
      const dbUser = userRows[0];
      if (!dbUser) {
        throw new Error(`Usuário ${ADMIN_EMAIL} não encontrado no banco.`);
      }

      const statusId = crypto.randomUUID();
      const statusName = `QA Smoke ${Date.now()}`;
      await client.query(
        'INSERT INTO "LeadStatus" ("id", "name", "color") VALUES ($1, $2, $3)',
        [statusId, statusName, '#ff7043'],
      );

      const leadId = crypto.randomUUID();
      const companyName = `QA Smoke ${crypto.randomUUID().slice(0, 8)}`;
      await client.query(
        'INSERT INTO "Lead" ("id", "company", "name", "statusId", "ownerId") VALUES ($1, $2, $3, $4, $5)',
        [leadId, companyName, companyName, statusId, dbUser.id],
      );

      const { rows: fetchedRows } = await client.query(
        'SELECT "id", "company", "statusId" FROM "Lead" WHERE "id" = $1',
        [leadId],
      );
      if (!fetchedRows[0]) {
        throw new Error('Lead recém-criado não foi encontrado.');
      }

      console.log('✓ Escrita e leitura no banco bem-sucedidas');

      await client.query('DELETE FROM "Lead" WHERE "id" = $1', [leadId]);
      await client.query('DELETE FROM "LeadStatus" WHERE "id" = $1', [statusId]);
    } finally {
      client.release();
    }

    console.log('Smoke test concluído com sucesso.');
  } finally {
    await pool.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
