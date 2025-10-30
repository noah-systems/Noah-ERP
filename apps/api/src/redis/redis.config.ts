const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = '6379';

function buildRedisUrl(host: string, port: string) {
  return `redis://${host}:${port}`;
}

export function resolveRedisUrl() {
  const explicitUrl = (process.env.REDIS_URL || '').trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const host = (process.env.REDIS_HOST || DEFAULT_HOST).trim() || DEFAULT_HOST;
  const port = (process.env.REDIS_PORT || DEFAULT_PORT).trim() || DEFAULT_PORT;
  return buildRedisUrl(host, port);
}
