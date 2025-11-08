import { Module } from '@nestjs/common';
import { NoahSequelizeModule } from '../../database/sequelize.module.js';
import { ImplementationController } from './implementation.controller.js';
import { ImplementationService } from './implementation.service.js';
import { implementationProviders } from './implementation.providers.js';

@Module({
  imports: [NoahSequelizeModule],
  controllers: [ImplementationController],
  providers: [...implementationProviders, ImplementationService],
})
export class ImplementationModule {}
