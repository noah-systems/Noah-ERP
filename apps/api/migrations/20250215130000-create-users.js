/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        password_hash: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM(
            'ADMIN_NOAH',
            'SUPPORT_NOAH',
            'FINANCE_NOAH',
            'SELLER',
            'PARTNER_MASTER',
            'PARTNER_OPS',
            'PARTNER_FINANCE',
          ),
          allowNull: false,
          defaultValue: 'SELLER',
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

    await queryInterface.addIndex('users', ['email'], { transaction });
  });
}

/** @type {import('sequelize-cli').Migration} */
export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('users', { transaction });
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";', { transaction });
  });
}
