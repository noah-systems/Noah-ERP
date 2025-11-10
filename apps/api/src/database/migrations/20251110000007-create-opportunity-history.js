'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('opportunity_history', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      opp_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'opportunities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      actor_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      from_stage_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'opportunity_stages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      to_stage_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'opportunity_stages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      note: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('opportunity_history', ['opp_id'], {
      name: 'opportunity_history_opp_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('opportunity_history');
  },
};
