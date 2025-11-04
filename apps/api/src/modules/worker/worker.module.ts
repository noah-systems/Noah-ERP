import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service.js';
import { WorkerController } from './worker.controller.js';
import { DatabaseService } from '../../database/database.service.js';

@Module({
  controllers: [WorkerController],
  providers: [WorkerService, DatabaseService],
  exports: [WorkerService],
})
export class WorkerModule {}
