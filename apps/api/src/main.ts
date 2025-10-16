import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://erp.noahomni.com.br',
  'https://erpapi.noahomni.com.br',
];

function parseCorsEnv(): string[] {
  const candidates = ['CORS_ORIGIN', 'CORS_ORIGINS'];
  const rawValues = candidates
    .map((key) => process.env[key] || '')
    .filter(Boolean);

  const origins = rawValues
    .flatMap((value) => value.split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(origins));
  return unique.length ? unique : DEFAULT_ALLOWED_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origins = parseCorsEnv();

  app.setGlobalPrefix('api');
  app.enableCors({ origin: origins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`API up on :${port}`);
}

bootstrap();
