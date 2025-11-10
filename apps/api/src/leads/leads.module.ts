import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LeadsController } from './leads.controller.js';
import { LeadsService } from './leads.service.js';
import { Lead } from '../database/models/lead.model.js';

@Module({
  imports: [SequelizeModule.forFeature([Lead])],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
