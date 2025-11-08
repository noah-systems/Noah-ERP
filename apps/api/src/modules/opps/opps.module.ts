import { Module } from '@nestjs/common';
import { OppsService } from './opps.service.js';
import { OppsController } from './opps.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../../database/database.module.js';
import { FinanceQueueService } from './finance-queue.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [OppsController],
  providers: [OppsService, FinanceQueueService],
})
export class OppsModule {}
