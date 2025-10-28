import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtModule } from '../jwt/jwt.module.js';
import { JwtAuthGuard } from './jwt.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
