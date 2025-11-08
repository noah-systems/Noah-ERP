import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { NoahSequelizeModule } from '../../database/sequelize.module.js';
import { usersProviders } from './users.providers.js';

@Module({
  imports: [AuthModule, NoahSequelizeModule],
  controllers: [UsersController],
  providers: [...usersProviders, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
