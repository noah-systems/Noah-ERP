/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('opportunities', {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    company_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    cnpj: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    contact_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    contact_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    contact_phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    finance_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    finance_phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    subdomain: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: '0.00',
    },
    stage: {
      type: Sequelize.ENUM(
        'NEGOTIATION',
        'PRESENTATION',
        'PROPOSAL',
        'TRIAL',
        'TRIAL_EXPIRING',
        'WON',
        'LOST',
      ),
      allowNull: false,
      defaultValue: 'NEGOTIATION',
    },
    trial_ends_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    tags: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    lost_reason: {
      type: Sequelize.TEXT,
      allowNull: true,
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
  });

  await queryInterface.addIndex('opportunities', ['stage']);
  await queryInterface.addIndex('opportunities', ['company_name']);
  await queryInterface.addIndex('opportunities', ['owner_id']);
}

/** @type {import('sequelize-cli').Migration} */
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('opportunities');
  await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_opportunities_stage\";");
}
