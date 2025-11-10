'use strict';

const ACCOUNT_STATUS_VALUES = ['PENDING_CREATE', 'ACTIVE', 'PENDING_CHANGE', 'CANCELED'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('partner_accounts', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      partner_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'partners',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      legal_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      cnpj: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      subdomain: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      users: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      hosting_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'hosting_providers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      server_ip: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      billing_base_day: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      connections: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
      },
      modules: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.DataTypes.ENUM(...ACCOUNT_STATUS_VALUES),
        allowNull: false,
        defaultValue: 'PENDING_CREATE',
      },
      note: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      activated_at: {
        type: Sequelize.DataTypes.DATE,
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

    await queryInterface.addIndex('partner_accounts', ['cnpj'], {
      unique: true,
      name: 'partner_accounts_cnpj_idx',
    });
    await queryInterface.addIndex('partner_accounts', ['partner_id'], {
      name: 'partner_accounts_partner_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('partner_accounts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_partner_accounts_status"');
  },
};
