'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('partner_change_requests', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      account_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'partner_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      payload: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('partner_change_requests', ['account_id'], {
      name: 'partner_change_requests_account_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('partner_change_requests');
  },
};
