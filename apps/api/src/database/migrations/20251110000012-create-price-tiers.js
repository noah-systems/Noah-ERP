'use strict';

const CHANNEL_VALUES = ['INTERNAL', 'WHITE_LABEL'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('price_tiers', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      channel: {
        type: Sequelize.DataTypes.ENUM(...CHANNEL_VALUES),
        allowNull: false,
      },
      min_users: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      max_users: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
      },
      price_per_user: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('price_tiers', ['channel', 'min_users'], {
      name: 'price_tiers_channel_min_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('price_tiers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_price_tiers_channel"');
  },
};
