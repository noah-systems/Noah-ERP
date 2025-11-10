'use strict';

const ROLE_VALUES = [
  'ADMIN_NOAH',
  'SUPPORT_NOAH',
  'FINANCE_NOAH',
  'SELLER',
  'PARTNER_MASTER',
  'PARTNER_OPS',
  'PARTNER_FINANCE',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.DataTypes.ENUM(...ROLE_VALUES),
        allowNull: false,
        defaultValue: 'SELLER',
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

    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role"');
  },
};
