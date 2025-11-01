import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cwd } from 'node:process';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(THIS_DIR, '..', '..');
const APPS_DIR = path.dirname(API_ROOT);
const WORKSPACE_ROOT = path.dirname(APPS_DIR);

const DEFAULT_ENV_BASENAMES = (() => {
  const env = process.env.NODE_ENV?.trim();
  if (env === 'production') {
    return ['.env.production', '.env'];
  }
  return ['.env'];
})();

function resolveExplicitPath(value: string) {
  return path.isAbsolute(value) ? value : path.resolve(cwd(), value);
}

const CANDIDATE_ENV_FILES = (() => {
  const seen = new Set<string>();
  const results: string[] = [];

  const explicitPath = process.env.NOAH_ENV_FILE?.trim();
  if (explicitPath) {
    const resolved = resolveExplicitPath(explicitPath);
    results.push(resolved);
    seen.add(resolved);
  }

  const searchRoots = [API_ROOT, APPS_DIR, WORKSPACE_ROOT, cwd()];
  for (const root of searchRoots) {
    if (!root) {
      continue;
    }
    for (const basename of DEFAULT_ENV_BASENAMES) {
      const candidate = path.resolve(root, basename);
      if (!seen.has(candidate)) {
        seen.add(candidate);
        results.push(candidate);
      }
    }
  }

  return results;
})();

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function applyEnvLine(line: string) {
  const sanitized = line.trim();
  if (!sanitized || sanitized.startsWith('#')) {
    return;
  }

  const normalized = sanitized.startsWith('export ')
    ? sanitized.slice('export '.length).trim()
    : sanitized;

  const indexOfEquals = normalized.indexOf('=');
  if (indexOfEquals === -1) {
    return;
  }

  const key = normalized.slice(0, indexOfEquals).trim();
  if (!key) {
    return;
  }

  const rawValue = normalized.slice(indexOfEquals + 1);
  const value = stripQuotes(rawValue);

  if (value === '' && rawValue.trim() === '') {
    return;
  }

  if (!(key in process.env)) {
    process.env[key] = value;
  }
}

function loadEnvFile(file: string) {
  if (!file) {
    return;
  }

  if (!fs.existsSync(file)) {
    return;
  }

  const contents = fs.readFileSync(file, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    applyEnvLine(line);
  }
}

for (const candidate of CANDIDATE_ENV_FILES) {
  loadEnvFile(candidate);
}

function firstNonEmpty(keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return fallback;
}

function buildDatabaseUrlFromPieces(): string | undefined {
  const host = firstNonEmpty(['DATABASE_HOST', 'DB_HOST', 'POSTGRES_HOST', 'PGHOST'], '127.0.0.1');
  const port = firstNonEmpty(['DATABASE_PORT', 'DB_PORT', 'POSTGRES_PORT', 'PGPORT'], '5432');
  const database = firstNonEmpty(
    ['DATABASE_NAME', 'DB_NAME', 'DB_DATABASE', 'POSTGRES_DB', 'PGDATABASE'],
    'postgres',
  );
  const user = firstNonEmpty(
    ['DATABASE_USER', 'DB_USER', 'DB_USERNAME', 'POSTGRES_USER', 'PGUSER'],
    'postgres',
  );
  const password = firstNonEmpty(
    ['DATABASE_PASSWORD', 'DB_PASSWORD', 'DB_PASS', 'POSTGRES_PASSWORD', 'PGPASSWORD'],
    '',
  );
  const schema = firstNonEmpty(['DATABASE_SCHEMA', 'DB_SCHEMA'], 'public');

  if (!user || !database) {
    return undefined;
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const auth = password ? `${encodedUser}:${encodedPassword}` : encodedUser;
  const baseUrl = `postgresql://${auth}@${host}:${port}/${database}`;
  return schema ? `${baseUrl}?schema=${encodeURIComponent(schema)}` : baseUrl;
}

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
  const builtUrl = buildDatabaseUrlFromPieces();
  if (builtUrl) {
    process.env.DATABASE_URL = builtUrl;
  }
}
