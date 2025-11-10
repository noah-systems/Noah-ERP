'use strict';

const CHANNEL_VALUES = ['INTERNAL', 'WHITE_LABEL'];
const ITEM_KIND_VALUES = ['PLAN', 'ADDON', 'MODULE'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('price_items', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      sku: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      channel: {
        type: Sequelize.DataTypes.ENUM(...CHANNEL_VALUES),
        allowNull: false,
      },
      kind: {
        type: Sequelize.DataTypes.ENUM(...ITEM_KIND_VALUES),
        allowNull: false,
      },
      active: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });

    await queryInterface.addIndex('price_items', ['channel'], { name: 'price_items_channel_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('price_items');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_price_items_channel"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_price_items_kind"');
  },
};
