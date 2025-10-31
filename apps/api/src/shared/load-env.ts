import path from 'node:path';
import fs from 'node:fs';

const PROJECT_ROOT = process.cwd();

const CANDIDATE_ENV_FILES = (() => {
  const overrides: string[] = [];
  const explicitPath = process.env.NOAH_ENV_FILE?.trim();
  if (explicitPath) {
    overrides.push(explicitPath);
  }

  const env = process.env.NODE_ENV?.trim();
  if (env === 'production') {
    overrides.push('.env.production');
  }

  overrides.push('.env');

  return overrides;
})();

function resolveCandidate(file: string) {
  return path.isAbsolute(file) ? file : path.join(PROJECT_ROOT, file);
}

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
  const resolved = resolveCandidate(file);
  if (!fs.existsSync(resolved)) {
    return;
  }

  const contents = fs.readFileSync(resolved, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    applyEnvLine(line);
  }
}

for (const candidate of CANDIDATE_ENV_FILES) {
  loadEnvFile(candidate);
}
