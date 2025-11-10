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
    await queryInterface.createTable('discount_policies', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      role: {
        type: Sequelize.DataTypes.ENUM(...ROLE_VALUES),
        allowNull: false,
        unique: true,
      },
      max_percent: {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('discount_policies');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_discount_policies_role"');
  },
};
