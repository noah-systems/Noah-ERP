import { existsSync } from 'fs';

const LOCALHOST = '127.0.0.1';
const DOCKER_HOST = 'redis';
const DEFAULT_PORT = '6379';
const DOCKER_SENTINEL = '/.dockerenv';

function isRunningInDocker() {
  try {
    return existsSync(DOCKER_SENTINEL);
  } catch (_err) {
    return false;
  }
}

function isLoopback(hostname?: string | null) {
  if (!hostname) {
    return false;
  }

  const normalized = hostname.toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

function buildRedisUrl(host: string, port: string) {
  return `redis://${host}:${port}`;
}

function defaultHost() {
  return isRunningInDocker() ? DOCKER_HOST : LOCALHOST;
}

export function resolveRedisUrl() {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  if (host || port) {
    const resolvedHost = host || defaultHost();
    const resolvedPort = port || DEFAULT_PORT;
    return buildRedisUrl(resolvedHost, resolvedPort);
  }

  const explicitUrl = process.env.REDIS_URL;
  if (explicitUrl) {
    try {
      const parsed = new URL(explicitUrl);
      if (isRunningInDocker() && isLoopback(parsed.hostname)) {
        return buildRedisUrl(DOCKER_HOST, parsed.port || DEFAULT_PORT);
      }
    } catch (_err) {
      // Se a URL for inválida, seguimos para o fallback padrão.
    }

    return explicitUrl;
  }

  return buildRedisUrl(defaultHost(), DEFAULT_PORT);
}
