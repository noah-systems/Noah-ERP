import { Module } from '@nestjs/common';
import { OppsService } from './opps.service.js';
import { OppsController } from './opps.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { FinanceQueueService } from './finance-queue.service.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { Opportunity } from '../../database/models/opportunity.model.js';

@Module({
  imports: [AuthModule, SequelizeModule.forFeature([Opportunity])],
  controllers: [OppsController],
  providers: [OppsService, FinanceQueueService],
})
export class OppsModule {}
