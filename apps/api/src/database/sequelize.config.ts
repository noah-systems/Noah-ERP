import type { Options } from 'sequelize';

type Numeric = string | number | undefined;

function parsePort(raw: Numeric): number {
  const value = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? '').trim(), 10);
  return Number.isFinite(value) && value > 0 ? value : 5432;
}

export function buildSequelizeConfig(): { url?: string; options: Options } {
  const {
    DATABASE_URL,
    DB_URL,
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_USER = 'postgres',
    DB_PASS = '',
    DB_NAME = 'postgres',
  } = process.env;

  const url = DATABASE_URL ?? DB_URL;
  if (url) {
    return {
      url,
      options: {
        dialect: 'postgres',
        logging: false,
      },
    };
  }

  return {
    options: {
      dialect: 'postgres',
      host: DB_HOST,
      port: parsePort(DB_PORT),
      username: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      logging: false,
    },
  };
}

export function resolveDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL ?? process.env.DB_URL;
}
