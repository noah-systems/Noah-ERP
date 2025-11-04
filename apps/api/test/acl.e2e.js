#!/usr/bin/env node
const { existsSync } = require('fs');
const { join } = require('path');
const { NestFactory } = require('@nestjs/core');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'ci-test-secret';

const distDir = join(__dirname, '..', 'dist');
if (!existsSync(join(distDir, 'main.js'))) {
  console.error('[acl-test] dist/main.js não encontrado. Rode "npm run build" antes do teste.');
  process.exit(1);
}

const { AppModule } = require('../dist/modules/app.module');
const { DatabaseService } = require('../dist/database/database.service');
const { LeadsService } = require('../dist/modules/leads/leads.service');
const { OppsService } = require('../dist/modules/opps/opps.service');
const { PricingService } = require('../dist/modules/pricing/pricing.service');
const { UsersService } = require('../dist/modules/users/users.service');
const { JwtService } = require('../dist/modules/jwt/jwt.service');
const { Role } = require('../dist/modules/auth/roles.enum');
const { WorkerService } = require('../dist/modules/worker/worker.service');

DatabaseService.prototype.onModuleInit = async function noop() {};
DatabaseService.prototype.enableShutdownHooks = async function noop() {};
WorkerService.prototype.onModuleInit = async function noop() {};
WorkerService.prototype.enqueue = async () => undefined;
WorkerService.prototype.health = () => ({ ok: true });

async function expectStatus(url, init, expected) {
  const response = await fetch(url, init);
  if (response.status !== expected) {
    throw new Error(`Esperado HTTP ${expected} em ${init.method || 'GET'} ${url}, recebido ${response.status}`);
  }
  return response;
}

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');

  const database = app.get(DatabaseService);
  database.queryRaw = async () => [{ ok: 1 }];
  database.transaction = async (fn) => fn({});

  const leads = app.get(LeadsService);
  leads.list = async () => [{ id: 'lead-1' }];
  leads.create = async () => ({ id: 'lead-created' });
  leads.updateStatus = async () => ({ id: 'lead-updated' });

  const opps = app.get(OppsService);
  opps.list = async () => [{ id: 'opp-1' }];
  opps.create = async () => ({ id: 'opp-created' });
  opps.updateStage = async () => ({ id: 'opp-updated' });
  opps.applyPricing = async () => ({ id: 'opp-priced' });
  opps.markLost = async () => ({ id: 'opp-lost' });

  const pricing = app.get(PricingService);
  pricing.listItems = async () => [{ sku: 'PLAN', price: 10 }];
  pricing.createItem = async () => ({ id: 'item-1' });
  pricing.listTiers = async () => [];
  pricing.createTier = async () => ({ id: 'tier-1' });
  pricing.listDiscountPolicies = async () => [];
  pricing.createDiscountPolicy = async () => ({ id: 'discount-1' });

  const users = app.get(UsersService);
  users.list = async () => [{ id: 'user-1', email: 'admin@example.com' }];

  await app.init();
  const server = await app.listen(0);
  const address = server.address();
  const port = typeof address === 'string' ? 80 : address.port;
  const base = `http://127.0.0.1:${port}/api`;

  const jwt = app.get(JwtService);
  const adminToken = await jwt.signAsync({ sub: 'admin-1', role: Role.ADMIN_NOAH });
  const sellerToken = await jwt.signAsync({ sub: 'seller-1', role: Role.SELLER });

  const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

  await expectStatus(`${base}/leads`, { headers: authHeader(sellerToken) }, 200);
  await expectStatus(`${base}/opps`, { headers: authHeader(sellerToken) }, 200);
  await expectStatus(`${base}/users`, { headers: authHeader(sellerToken) }, 403);

  await expectStatus(
    `${base}/pricing/items`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(sellerToken) },
      body: JSON.stringify({ sku: 'NEW', name: 'New', price: 1 }),
    },
    403
  );

  await expectStatus(
    `${base}/pricing/items`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(adminToken) },
      body: JSON.stringify({ sku: 'ADMIN', name: 'Admin', price: 1 }),
    },
    201
  );

  await expectStatus(`${base}/users`, { headers: authHeader(adminToken) }, 200);

  await app.close();
}

main().catch((err) => {
  console.error('[acl-test] falha:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
