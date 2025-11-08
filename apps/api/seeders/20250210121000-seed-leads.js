import crypto from 'node:crypto';

/** @type {import('sequelize-cli').Seeder} */
export async function up(queryInterface) {
  const now = new Date();
  await queryInterface.bulkInsert('leads', [
    {
      id: crypto.randomUUID(),
      company_name: 'Empresa A',
      segment: 'Tecnologia',
      employees_count: 35,
      contact_name: 'João Silva',
      phone: '+55 11 99999-0001',
      email: 'contato@empresaa.com',
      source: 'Inbound',
      status: 'NURTURING',
      owner_id: null,
      notes: 'Interessado em demonstração.',
      created_at: now,
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      company_name: 'Distribuidora XYZ',
      segment: 'Varejo',
      employees_count: 80,
      contact_name: 'Maria Souza',
      phone: '+55 21 98888-1000',
      email: 'maria@xyz.com',
      source: 'Manual',
      status: 'QUALIFIED',
      owner_id: null,
      notes: 'Solicitou proposta formal.',
      created_at: now,
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      company_name: 'Pepper Labs',
      segment: 'Marketing',
      employees_count: 12,
      contact_name: 'Carlos Mendes',
      phone: '+55 31 97777-2000',
      email: 'carlos@pepperlabs.co',
      source: 'Evento',
      status: 'DISQUALIFIED',
      owner_id: null,
      notes: 'Sem budget no momento.',
      created_at: now,
      updated_at: now,
    },
  ]);
}

/** @type {import('sequelize-cli').Seeder} */
export async function down(queryInterface) {
  await queryInterface.bulkDelete('leads', null, {});
}
