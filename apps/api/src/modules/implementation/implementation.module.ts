import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ImplementationController } from './implementation.controller.js';
import { ImplementationService } from './implementation.service.js';
import { ImplementationTask } from '../../database/models/implementation-task.model.js';
import { ImplementationEvent } from '../../database/models/implementation-event.model.js';

@Module({
  imports: [SequelizeModule.forFeature([ImplementationTask, ImplementationEvent])],
  controllers: [ImplementationController],
  providers: [ImplementationService],
})
export class ImplementationModule {}
