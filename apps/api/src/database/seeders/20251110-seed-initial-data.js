'use strict';

const crypto = require('node:crypto');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = Sequelize;
    const now = new Date();

    const [admin] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      {
        replacements: { email: (process.env.ADMIN_EMAIL || 'admin@noahomni.com.br').trim().toLowerCase() },
        type: QueryTypes.SELECT,
      },
    );

    const adminId = admin?.id || crypto.randomUUID();

    if (!admin) {
      await queryInterface.bulkInsert('users', [
        {
          id: adminId,
          email: 'seed-admin@noahomni.com.br',
          name: 'Seed Admin',
          password_hash: '$2a$12$QpO2DeU8Y1yR8ZV1oX5pQ.VF2G0z3Jr6yJ0ZbW51o2j0QdLEcL1vG',
          role: 'ADMIN_NOAH',
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    await seedLead(queryInterface, QueryTypes, {
      company_name: 'Empresa A',
      segment: 'Tecnologia',
      employees_count: 35,
      contact_name: 'João Silva',
      phone: '+55 11 99999-0001',
      email: 'contato@empresaa.com',
      source: 'Inbound',
      status: 'NURTURING',
      notes: 'Interessado em demonstração.',
    });

    await seedLead(queryInterface, QueryTypes, {
      company_name: 'Distribuidora XYZ',
      segment: 'Varejo',
      employees_count: 80,
      contact_name: 'Maria Souza',
      phone: '+55 21 98888-1000',
      email: 'maria@xyz.com',
      source: 'Manual',
      status: 'QUALIFIED',
      notes: 'Solicitou proposta formal.',
    });

    const hostingId = await ensureHostingProvider(queryInterface, QueryTypes, 'Noah Cloud');
    const partnerId = await ensurePartner(queryInterface, QueryTypes, {
      nickname: 'Parceiro Atlas',
      legal_name: 'Atlas Tecnologia Ltda',
      cnpj: '12.345.678/0001-00',
      contact: 'Paula Santos',
    });
    const accountId = await ensurePartnerAccount(queryInterface, QueryTypes, {
      partnerId,
      hostingId,
      legalName: 'Conta Atlas Tecnologia',
      cnpj: '12.345.678/0001-00',
      email: 'contato@atlas.com.br',
      domain: 'atlas.noahomni.com.br',
    });

    await seedOpportunity(queryInterface, QueryTypes, {
      company_name: 'Empresa A',
      contact_name: 'João Silva',
      owner_id: adminId,
      amount: 4500,
      stage: 'NEGOTIATION',
    });

    await seedImplementationTask(queryInterface, QueryTypes, {
      account_id: accountId,
      domain: 'cliente-alpha.com.br',
      segment: 'Tecnologia',
      status: 'PENDING',
      created_by_id: adminId,
      notes: 'Aguardando definição do ambiente.',
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('implementation_events', null, {});
    await queryInterface.bulkDelete('implementation_tasks', null, {});
    await queryInterface.bulkDelete('opportunities', null, {});
    await queryInterface.bulkDelete('partner_accounts', null, {});
    await queryInterface.bulkDelete('partners', null, {});
    await queryInterface.bulkDelete('hosting_providers', null, {});
    await queryInterface.bulkDelete('leads', null, {});
  },
};

async function seedLead(queryInterface, QueryTypes, payload) {
  const existing = await queryInterface.sequelize.query(
    'SELECT id FROM leads WHERE company_name = :company LIMIT 1',
    { replacements: { company: payload.company_name }, type: QueryTypes.SELECT },
  );
  if (existing.length > 0) {
    return;
  }
  await queryInterface.bulkInsert('leads', [
    {
      id: crypto.randomUUID(),
      ...payload,
      owner_id: null,
      status_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

async function ensureHostingProvider(queryInterface, QueryTypes, name) {
  const existing = await queryInterface.sequelize.query(
    'SELECT id FROM hosting_providers WHERE name = :name LIMIT 1',
    { replacements: { name }, type: QueryTypes.SELECT },
  );
  if (existing.length > 0) {
    return existing[0].id;
  }
  const id = crypto.randomUUID();
  await queryInterface.bulkInsert('hosting_providers', [
    { id, name },
  ]);
  return id;
}

async function ensurePartner(queryInterface, QueryTypes, payload) {
  const existing = await queryInterface.sequelize.query(
    'SELECT id FROM partners WHERE cnpj = :cnpj LIMIT 1',
    { replacements: { cnpj: payload.cnpj }, type: QueryTypes.SELECT },
  );
  if (existing.length > 0) {
    return existing[0].id;
  }
  const id = crypto.randomUUID();
  await queryInterface.bulkInsert('partners', [
    {
      id,
      nickname: payload.nickname,
      legal_name: payload.legal_name,
      cnpj: payload.cnpj,
      address: payload.address ?? null,
      domain: payload.domain ?? null,
      contact: payload.contact ?? null,
      whatsapp: payload.whatsapp ?? null,
      finance_email: payload.finance_email ?? null,
      price_table: null,
    },
  ]);
  return id;
}

async function ensurePartnerAccount(queryInterface, QueryTypes, payload) {
  const existing = await queryInterface.sequelize.query(
    'SELECT id FROM partner_accounts WHERE cnpj = :cnpj LIMIT 1',
    { replacements: { cnpj: payload.cnpj }, type: QueryTypes.SELECT },
  );
  if (existing.length > 0) {
    return existing[0].id;
  }
  const id = crypto.randomUUID();
  await queryInterface.bulkInsert('partner_accounts', [
    {
      id,
      partner_id: payload.partnerId,
      legal_name: payload.legalName,
      cnpj: payload.cnpj,
      email: payload.email,
      phone: null,
      subdomain: payload.domain,
      users: 10,
      hosting_id: payload.hostingId,
      server_ip: null,
      billing_base_day: 5,
      connections: null,
      modules: null,
      status: 'PENDING_CREATE',
      note: null,
      activated_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
  return id;
}

async function seedOpportunity(queryInterface, QueryTypes, payload) {
  const existing = await queryInterface.sequelize.query(
    'SELECT id FROM opportunities WHERE company_name = :company LIMIT 1',
    { replacements: { company: payload.company_name }, type: QueryTypes.SELECT },
  );
  if (existing.length > 0) {
    return;
  }
  await queryInterface.bulkInsert('opportunities', [
    {
      id: crypto.randomUUID(),
      company_name: payload.company_name,
      cnpj: null,
      contact_name: payload.contact_name,
      contact_email: null,
      contact_phone: null,
      finance_email: null,
      finance_phone: null,
      subdomain: null,
      amount: Number.isFinite(payload.amount) ? Number(payload.amount).toFixed(2) : '0.00',
      stage: payload.stage,
      trial_ends_at: null,
      owner_id: payload.owner_id,
      lead_id: null,
      stage_id: null,
      hosting_id: null,
      tags: [],
      lost_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

async function seedImplementationTask(queryInterface, QueryTypes, payload) {
  const existing = await queryInterface.sequelize.query(
    'SELECT id FROM implementation_tasks WHERE domain = :domain LIMIT 1',
    { replacements: { domain: payload.domain }, type: QueryTypes.SELECT },
  );
  if (existing.length > 0) {
    return;
  }
  const taskId = crypto.randomUUID();
  const now = new Date();
  await queryInterface.bulkInsert('implementation_tasks', [
    {
      id: taskId,
      account_id: payload.account_id,
      domain: payload.domain,
      segment: payload.segment ?? null,
      status: payload.status,
      assignee_id: payload.assignee_id ?? null,
      scheduled_at: payload.scheduled_at ?? null,
      notes: payload.notes ?? null,
      position: 0,
      created_by_id: payload.created_by_id,
      created_at: now,
      updated_at: now,
    },
  ]);

  await queryInterface.bulkInsert('implementation_events', [
    {
      id: crypto.randomUUID(),
      task_id: taskId,
      type: 'COMMENT',
      payload: { notes: payload.notes ?? 'Tarefa criada automaticamente.' },
      created_by_id: payload.created_by_id,
      created_at: now,
    },
  ]);
}
