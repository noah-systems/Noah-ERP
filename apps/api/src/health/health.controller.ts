import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // simples e auto-contido para health

@Controller('health')
export class HealthController {
  @Get()
  ok() {
    return { ok: true, ts: new Date().toISOString() };
  }

  @Get('db')
  async db() {
    await prisma.$queryRaw`SELECT 1`;
    return { db: 'ok' };
  }
}
