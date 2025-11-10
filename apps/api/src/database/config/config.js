import { config as loadEnv } from 'dotenv';

const envFile = process.env.NOAH_ENV_FILE || '.env';
loadEnv({ path: envFile });

function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.DB_URL;
  if (url && url.trim().length > 0) {
    return url.trim();
  }

  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  if (nodeEnv !== 'production') {
    return 'postgresql://postgres@localhost:5432/postgres';
  }

  throw new Error('DATABASE_URL environment variable is required');
}

const shared = {
  dialect: 'postgres',
};

const resolvedUrl = resolveDatabaseUrl();

const configuration = {
  development: { ...shared, url: resolvedUrl },
  test: { ...shared, url: resolvedUrl },
  production: { ...shared, url: resolvedUrl },
};

export default configuration;
export const { development, test, production } = configuration;

if (typeof module !== 'undefined') {
  module.exports = configuration;
}
