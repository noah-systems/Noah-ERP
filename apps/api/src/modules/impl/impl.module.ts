import { Module } from '@nestjs/common';
import { ImplService } from './impl.service.js';
import { ImplController } from './impl.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ImplController],
  providers: [ImplService, PrismaService],
})
export class ImplModule {}
