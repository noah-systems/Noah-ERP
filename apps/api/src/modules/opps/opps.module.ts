import { Module } from '@nestjs/common';
import { OppsService } from './opps.service';
import { OppsController } from './opps.controller';
import { PrismaService } from '../../prisma.service';
import { WorkerModule } from '../worker/worker.module';

@Module({
  imports: [WorkerModule],
  controllers: [OppsController],
  providers: [OppsService, PrismaService],
})
export class OppsModule {}
