'use strict';

const EVENT_TYPE_VALUES = ['SCHEDULED', 'DONE', 'UNSUCCESSFUL', 'COMMENT'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('implementation_events', {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      task_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'implementation_tasks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.DataTypes.ENUM(...EVENT_TYPE_VALUES),
        allowNull: false,
      },
      payload: {
        type: Sequelize.DataTypes.JSONB,
        allowNull: true,
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
    });

    await queryInterface.addIndex('implementation_events', ['task_id'], {
      name: 'implementation_events_task_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('implementation_events');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_implementation_events_type"');
  },
};
