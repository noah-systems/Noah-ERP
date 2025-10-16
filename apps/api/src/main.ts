import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://erp.noahomni.com.br',
  'https://erpapi.noahomni.com.br',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const ORIGIN_ENV_KEYS = [
  'CORS_ORIGIN',
  'CORS_ORIGINS',
  'NOAH_WEB_ORIGIN',
  'NOAH_WEB_ORIGINS',
  'FRONTEND_ORIGIN',
  'FRONTEND_ORIGINS',
];

type CorsResolution = {
  allowAll: boolean;
  origins: string[];
};

type BasicResponse = {
  setHeader(name: string, value: string): void;
};

type NextFunction = (err?: unknown) => void;

function applySecurityHeaders(_req: unknown, res: BasicResponse, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
}

function normalizeOrigin(origin: string): string | null {
  const trimmed = origin.trim();
  if (!trimmed) return null;
  if (trimmed === '*') return '*';
  try {
    const url = new URL(trimmed);
    if (!url.protocol || !url.host) {
      return null;
    }
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    return trimmed.replace(/\/+$/, '');
  }
}

function splitOriginList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function resolveCorsOrigins(): CorsResolution {
  const resolved = new Set<string>();

  for (const key of ORIGIN_ENV_KEYS) {
    const tokens = splitOriginList(process.env[key]);
    for (const token of tokens) {
      const normalized = normalizeOrigin(token);
      if (normalized) {
        resolved.add(normalized);
      }
    }
  }

  if (resolved.size === 0) {
    for (const origin of DEFAULT_ALLOWED_ORIGINS) {
      const normalized = normalizeOrigin(origin);
      if (normalized) {
        resolved.add(normalized);
      }
    }
  }

  const allowAll = resolved.has('*');
  if (allowAll) {
    resolved.delete('*');
  }

  return {
    allowAll,
    origins: Array.from(resolved),
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('NoahERP');
  app.useLogger(logger);
  if (typeof app.flushLogs === 'function') {
    app.flushLogs();
  }

  const { allowAll, origins } = resolveCorsOrigins();
  const allowedOrigins = new Set(origins);
  if (allowAll) {
    logger.log('CORS origins: allow all');
  } else {
    logger.log(`CORS origins: ${origins.join(', ')}`);
  }

  const instance = app.getHttpAdapter().getInstance?.();
  if (instance?.disable) {
    instance.disable('x-powered-by');
  }

  app.use(applySecurityHeaders);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: allowAll
      ? true
      : (origin, callback) => {
          if (!origin) {
            callback(null, true);
            return;
          }
          const normalized = normalizeOrigin(origin);
          if (normalized && allowedOrigins.has(normalized)) {
            callback(null, true);
            return;
          }
          callback(new Error(`Origin not allowed: ${origin}`), false);
        },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
    exposedHeaders: ['Content-Length'],
    maxAge: 86400,
  });

  app.useGlobalInterceptors(new LoggingInterceptor(new Logger('HTTP')));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.enableShutdownHooks();

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`API up on :${port}`);
}

bootstrap();
