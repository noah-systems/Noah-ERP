import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

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

  const instance = app.getHttpAdapter().getInstance?.();
  if (instance?.disable) {
    instance.disable('x-powered-by');
  }

  app.use(applySecurityHeaders);
  app.useGlobalInterceptors(new LoggingInterceptor(new Logger('HTTP')));
  await app.enableShutdownHooks();

  const corsEnv = process.env.CORS_ORIGINS || '';
  const origins = corsEnv
    ? corsEnv.split(',').map(s => s.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://erp.noahomni.com.br'];
  app.enableCors({ origin: origins, credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000, '0.0.0.0');

  logger.log(`CORS origins: ${origins.join(', ') || '(none)'}`);
  const server = app.getHttpServer();
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : process.env.PORT || 3000;
  logger.log(`API up on :${port}`);
}

bootstrap();
