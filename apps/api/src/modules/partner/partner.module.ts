import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service.js';
import { PartnerController } from './partner.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PartnerController],
  providers: [PartnerService, PrismaService],
})
export class PartnerModule {}
