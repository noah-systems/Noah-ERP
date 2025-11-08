/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('leads', {
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
    segment: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    employees_count: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    contact_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    source: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM('NURTURING', 'QUALIFIED', 'DISQUALIFIED'),
      allowNull: false,
      defaultValue: 'NURTURING',
    },
    owner_id: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    notes: {
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

  await queryInterface.addIndex('leads', ['status']);
  await queryInterface.addIndex('leads', ['company_name']);
}

/** @type {import('sequelize-cli').Migration} */
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('leads');
  await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_leads_status\";");
}
