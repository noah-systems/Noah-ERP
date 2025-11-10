'use strict';

const LEAD_STATUS_VALUES = ['NURTURING', 'QUALIFIED', 'DISQUALIFIED'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leads', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      company_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      segment: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      employees_count: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      contact_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      source: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.DataTypes.ENUM(...LEAD_STATUS_VALUES),
        allowNull: false,
        defaultValue: 'NURTURING',
      },
      status_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'lead_statuses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      owner_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notes: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('leads', ['status'], { name: 'leads_status_idx' });
    await queryInterface.addIndex('leads', ['company_name'], { name: 'leads_company_name_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('leads');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_leads_status"');
  },
};
