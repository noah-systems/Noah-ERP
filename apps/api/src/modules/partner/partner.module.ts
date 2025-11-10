import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service.js';
import { PartnerController } from './partner.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { Partner } from '../../database/models/partner.model.js';
import { PartnerAccount } from '../../database/models/partner-account.model.js';
import { PartnerChangeRequest } from '../../database/models/partner-change-request.model.js';
import { HostingProvider } from '../../database/models/hosting-provider.model.js';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([Partner, PartnerAccount, PartnerChangeRequest, HostingProvider]),
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
})
export class PartnerModule {}
