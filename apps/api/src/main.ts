import 'reflect-metadata';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
import { LoggingInterceptor } from './interceptors/logging.interceptor.js';

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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('NoahERP');
  app.useLogger(logger);
  if (typeof app.flushLogs === 'function') {
    app.flushLogs();
  }

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: 'api/health', method: RequestMethod.ALL },
    ],
  });

  const instance = app.getHttpAdapter().getInstance?.();
  if (instance?.disable) {
    instance.disable('x-powered-by');
  }

  app.use(applySecurityHeaders);
  app.useGlobalInterceptors(new LoggingInterceptor(new Logger('HTTP')));
  await app.enableShutdownHooks();

  const frontendOriginEnv = process.env.FRONTEND_ORIGIN || '';
  const allowedOrigins = frontendOriginEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const effectiveOrigins = allowedOrigins.length ? allowedOrigins : ['http://localhost'];
  app.enableCors({ origin: effectiveOrigins, credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const rawPort = process.env.API_PORT || process.env.PORT || '3001';
  const port = Number(rawPort) || 3001;

  await app.listen(port, '0.0.0.0');

  logger.log(`CORS origins: ${effectiveOrigins.join(', ') || '(none)'}`);
  logger.log(`API up on :${port}`);
}

bootstrap();
