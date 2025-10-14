import { Module } from '@nestjs/common';
import { ImplService } from './impl.service';
import { ImplController } from './impl.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ImplController],
  providers: [ImplService, PrismaService],
})
export class ImplModule {}
