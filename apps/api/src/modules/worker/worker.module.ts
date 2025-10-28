import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service.js';
import { WorkerController } from './worker.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Module({
  controllers: [WorkerController],
  providers: [WorkerService, PrismaService],
  exports: [WorkerService],
})
export class WorkerModule {}
