'use strict';

const TASK_STATUS_VALUES = ['PENDING', 'SCHEDULED', 'DONE', 'UNSUCCESSFUL'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('implementation_tasks', {
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
      domain: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      segment: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.DataTypes.ENUM(...TASK_STATUS_VALUES),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      assignee_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      scheduled_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      position: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_by_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('implementation_tasks', ['account_id'], {
      name: 'implementation_tasks_account_idx',
    });
    await queryInterface.addIndex('implementation_tasks', ['status'], {
      name: 'implementation_tasks_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('implementation_tasks');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_implementation_tasks_status"');
  },
};
