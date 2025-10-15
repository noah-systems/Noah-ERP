import { Module } from '@nestjs/common';
import { ImplService } from './impl.service';
import { ImplController } from './impl.controller';
import { PrismaService } from '../../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ImplController],
  providers: [ImplService, PrismaService],
})
export class ImplModule {}
