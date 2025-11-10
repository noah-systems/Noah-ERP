'use strict';

const bcrypt = require('bcryptjs');

const ADMIN_NAME = (process.env.ADMIN_NAME || 'Admin Noah').trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@noahomni.com.br').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const replacements = { email: ADMIN_EMAIL };
    const existing = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements, type: Sequelize.QueryTypes.SELECT },
    );

    const now = new Date();
    if (Array.isArray(existing) && existing.length > 0) {
      const [{ id }] = existing;
      await queryInterface.bulkUpdate(
        'users',
        {
          name: ADMIN_NAME,
          password_hash: hash,
          role: 'ADMIN_NOAH',
          updated_at: now,
        },
        { id },
      );
    } else {
      await queryInterface.bulkInsert('users', [
        {
          id: Sequelize.literal('gen_random_uuid()'),
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password_hash: hash,
          role: 'ADMIN_NOAH',
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ADMIN_EMAIL });
  },
};
