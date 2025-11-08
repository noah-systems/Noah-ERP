import crypto from 'node:crypto';

/** @type {import('sequelize-cli').Seeder} */
export async function up(queryInterface, Sequelize) {
  const now = new Date();
  const adminId = crypto.randomUUID();
  const supportId = crypto.randomUUID();
  const schedulerId = crypto.randomUUID();

  const pendingTaskId = crypto.randomUUID();
  const scheduledTaskId = crypto.randomUUID();
  const doneTaskId = crypto.randomUUID();

  await queryInterface.bulkInsert('implementation_tasks', [
    {
      id: pendingTaskId,
      account_id: crypto.randomUUID(),
      domain: 'cliente-alpha.com.br',
      segment: 'Tecnologia',
      status: 'PENDING',
      assignee_id: null,
      scheduled_at: null,
      notes: 'Aguardando definição do ambiente.',
      position: 0,
      created_by_id: adminId,
      created_at: now,
      updated_at: now,
    },
    {
      id: scheduledTaskId,
      account_id: crypto.randomUUID(),
      domain: 'varejo-bravo.com',
      segment: 'Varejo',
      status: 'SCHEDULED',
      assignee_id: supportId,
      scheduled_at: new Date(now.getTime() + 1000 * 60 * 60 * 24),
      notes: 'Cliente confirmou treinamento às 10h.',
      position: 0,
      created_by_id: adminId,
      created_at: now,
      updated_at: now,
    },
    {
      id: doneTaskId,
      account_id: crypto.randomUUID(),
      domain: 'finance-charlie.com',
      segment: 'Financeiro',
      status: 'DONE',
      assignee_id: schedulerId,
      scheduled_at: new Date(now.getTime() - 1000 * 60 * 60 * 48),
      notes: 'Implantação concluída com treinamento adicional.',
      position: 0,
      created_by_id: adminId,
      created_at: now,
      updated_at: now,
    },
  ]);

  await queryInterface.bulkInsert('implementation_events', [
    {
      id: crypto.randomUUID(),
      task_id: scheduledTaskId,
      type: 'SCHEDULED',
      payload: {
        scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),
        assigneeId: supportId,
        notes: 'Cliente confirmou treinamento às 10h.',
      },
      created_by_id: schedulerId,
      created_at: now,
    },
    {
      id: crypto.randomUUID(),
      task_id: doneTaskId,
      type: 'DONE',
      payload: {
        completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        notes: 'Implantação concluída com treinamento adicional.',
      },
      created_by_id: schedulerId,
      created_at: now,
    },
    {
      id: crypto.randomUUID(),
      task_id: pendingTaskId,
      type: 'COMMENT',
      payload: {
        notes: 'Checklist inicial enviado ao cliente.',
      },
      created_by_id: adminId,
      created_at: now,
    },
  ]);
}

/** @type {import('sequelize-cli').Seeder} */
export async function down(queryInterface) {
  await queryInterface.bulkDelete('implementation_events', null, {});
  await queryInterface.bulkDelete('implementation_tasks', null, {});
}
