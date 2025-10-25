const DEFAULT_HOST = 'redis';
const DEFAULT_PORT = '6379';

export function resolveRedisUrl() {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  if (host || port) {
    const resolvedHost = host || DEFAULT_HOST;
    const resolvedPort = port || DEFAULT_PORT;
    return `redis://${resolvedHost}:${resolvedPort}`;
  }

  return process.env.REDIS_URL || `redis://${DEFAULT_HOST}:${DEFAULT_PORT}`;
}
