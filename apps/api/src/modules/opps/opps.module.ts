import { Module } from '@nestjs/common';
import { OppsService } from './opps.service.js';
import { OppsController } from './opps.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WorkerModule } from '../worker/worker.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [WorkerModule, AuthModule],
  controllers: [OppsController],
  providers: [OppsService, PrismaService],
})
export class OppsModule {}
