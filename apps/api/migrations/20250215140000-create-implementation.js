/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'implementation_tasks',
      {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        account_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        domain: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        segment: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'SCHEDULED', 'DONE', 'UNSUCCESSFUL'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        assignee_id: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        scheduled_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        position: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        created_by_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      },
      { transaction },
    );

    await queryInterface.addIndex('implementation_tasks', ['status'], { transaction });
    await queryInterface.addIndex('implementation_tasks', ['assignee_id'], { transaction });

    await queryInterface.createTable(
      'implementation_events',
      {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        task_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'implementation_tasks',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        type: {
          type: Sequelize.ENUM('SCHEDULED', 'DONE', 'UNSUCCESSFUL', 'COMMENT'),
          allowNull: false,
        },
        payload: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        created_by_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      },
      { transaction },
    );

    await queryInterface.addIndex('implementation_events', ['task_id'], { transaction });
    await queryInterface.addIndex('implementation_events', ['type'], { transaction });
  });
}

/** @type {import('sequelize-cli').Migration} */
export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('implementation_events', { transaction });
    await queryInterface.dropTable('implementation_tasks', { transaction });
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_implementation_tasks_status";', { transaction });
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_implementation_events_type";', { transaction });
  });
}
