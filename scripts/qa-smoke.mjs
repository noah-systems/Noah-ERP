#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const API_BASE = process.env.QA_API_URL || process.env.API_BASE || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@noahomni.com.br';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL precisa estar definido para executar o QA smoke.');
  }

  const prisma = new PrismaClient();

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

    const dbUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!dbUser) {
      throw new Error(`Usuário ${ADMIN_EMAIL} não encontrado no banco.`);
    }

    const status = await prisma.leadStatus.create({
      data: {
        name: `QA Smoke ${Date.now()}`,
        color: '#ff7043',
      },
    });

    const lead = await prisma.lead.create({
      data: {
        company: `QA Smoke ${crypto.randomUUID().slice(0, 8)}`,
        statusId: status.id,
        ownerId: dbUser.id,
      },
    });

    const fetched = await prisma.lead.findUnique({
      where: { id: lead.id },
      select: { id: true, company: true, statusId: true },
    });

    if (!fetched) {
      throw new Error('Lead recém-criado não foi encontrado.');
    }

    console.log('✓ Escrita e leitura no banco bem-sucedidas');

    await prisma.lead.delete({ where: { id: lead.id } }).catch(() => {});
    await prisma.leadStatus.delete({ where: { id: status.id } }).catch(() => {});

    console.log('Smoke test concluído com sucesso.');
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
