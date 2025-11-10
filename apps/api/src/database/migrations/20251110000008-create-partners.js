'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('partners', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      nickname: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      legal_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      cnpj: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      domain: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      contact: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      whatsapp: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      finance_email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      price_table: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('partners', ['cnpj'], {
      unique: true,
      name: 'partners_cnpj_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('partners');
  },
};
