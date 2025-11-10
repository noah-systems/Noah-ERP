require('dotenv').config({ path: process.env.NOAH_ENV_FILE || '.env' });
module.exports = {
  development: { use_env_variable: 'DATABASE_URL', dialect: 'postgres' },
  test: { use_env_variable: 'DATABASE_URL', dialect: 'postgres' },
  production: { use_env_variable: 'DATABASE_URL', dialect: 'postgres' },
};
