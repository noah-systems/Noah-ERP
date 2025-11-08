import dotenv from 'dotenv';
import { buildSequelizeConfig } from './src/database/sequelize.config.js';

dotenv.config();

function toCliConfig() {
  const { url, options } = buildSequelizeConfig();
  if (url) {
    return {
      url,
      dialect: 'postgres',
      ...options,
    };
  }
  return { ...options };
}

const config = toCliConfig();

export default {
  development: config,
  test: config,
  production: config,
};
