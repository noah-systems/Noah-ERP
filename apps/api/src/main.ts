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
];

type BasicResponse = { setHeader(name: string, value: string): void };
type NextFunction = (err?: unknown) => void;

const securityHeaders = (_req: unknown, res: BasicResponse, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  next();
};

function normalizeOrigin(origin: string): string | null {
  const trimmed = origin.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    return trimmed.replace(/\/+$/, '');
  }
}

function parseCorsEnv(): string[] {
  const candidates = ['CORS_ORIGIN', 'CORS_ORIGINS'];
  const allowed = new Set<string>();

  for (const key of candidates) {
    const envValue = process.env[key];
    if (!envValue) continue;
    for (const value of envValue.split(',')) {
      const normalized = normalizeOrigin(value);
      if (normalized) {
        allowed.add(normalized);
      }
    }
  }

  if (allowed.size === 0) {
    DEFAULT_ALLOWED_ORIGINS.forEach((origin) => allowed.add(origin));
  }

  return Array.from(allowed);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('NoahERP');
  app.useLogger(logger);

  const origins = parseCorsEnv();
  const allowedOrigins = new Set(origins.map((origin) => normalizeOrigin(origin) ?? origin));

  const instance = app.getHttpAdapter().getInstance?.();
  if (instance?.disable) {
    instance.disable('x-powered-by');
  }

  app.use(securityHeaders);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
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
