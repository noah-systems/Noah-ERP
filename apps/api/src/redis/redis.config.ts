const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = '6379';

function firstAvailableHost() {
  const candidates = [
    process.env.REDIS_HOST,
    process.env.REDIS_PRIMARY_HOST,
    process.env.REDIS_HOST_FALLBACK,
    process.env.REDIS_ALT_HOST,
    DEFAULT_HOST,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return DEFAULT_HOST;
}

function firstAvailablePort() {
  const candidates = [process.env.REDIS_PORT, process.env.REDIS_PORT_FALLBACK, DEFAULT_PORT];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return DEFAULT_PORT;
}

function buildRedisUrl(host: string, port: string) {
  return `redis://${host}:${port}`;
}

export function resolveRedisUrl() {
  const explicitUrl = (process.env.REDIS_URL || '').trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const host = firstAvailableHost();
  const port = firstAvailablePort();
  return buildRedisUrl(host, port);
}
