import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '../jwt/jwt.module.js';
import { JwtAuthGuard } from './jwt.guard.js';
import { RolesGuard } from './roles.guard.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../database/models/user.model.js';

@Module({
  imports: [JwtModule, SequelizeModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
