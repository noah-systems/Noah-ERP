import { Module } from '@nestjs/common';
import { ImplService } from './impl.service.js';
import { ImplController } from './impl.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ImplController],
  providers: [ImplService, DatabaseService],
})
export class ImplModule {}
