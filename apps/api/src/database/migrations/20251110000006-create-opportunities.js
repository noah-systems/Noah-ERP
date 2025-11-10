'use strict';

const OPPORTUNITY_STAGE_VALUES = [
  'NEGOTIATION',
  'PRESENTATION',
  'PROPOSAL',
  'TRIAL',
  'TRIAL_EXPIRING',
  'WON',
  'LOST',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('opportunities', {
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
      cnpj: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      contact_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      contact_email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      contact_phone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      finance_email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      finance_phone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      subdomain: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: '0.00',
      },
      stage: {
        type: Sequelize.DataTypes.ENUM(...OPPORTUNITY_STAGE_VALUES),
        allowNull: false,
        defaultValue: 'NEGOTIATION',
      },
      trial_ends_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      owner_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      lead_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'leads',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      stage_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'opportunity_stages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      tags: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'[]'::jsonb"),
      },
      lost_reason: {
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

    await queryInterface.addIndex('opportunities', ['stage'], { name: 'opportunities_stage_idx' });
    await queryInterface.addIndex('opportunities', ['owner_id'], { name: 'opportunities_owner_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('opportunities');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_opportunities_stage"');
  },
};
