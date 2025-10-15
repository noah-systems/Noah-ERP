import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service';
import {
  CreateChangeRequestDto,
  CreatePartnerAccountDto,
  CreatePartnerDto,
  ResolveChangeDto,
} from './partner.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PartnerController {
  constructor(private readonly partners: PartnerService) {}

  @Roles('ADMIN_NOAH')
  @Post('partners')
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.partners.createPartner(dto);
  }

  @Roles('ADMIN_NOAH', 'PARTNER_MASTER', 'PARTNER_OPS')
  @Post('partners/:id/accounts')
  createAccount(@Param('id') partnerId: string, @Body() dto: CreatePartnerAccountDto) {
    return this.partners.createAccount(partnerId, dto);
  }

  @Roles('ADMIN_NOAH', 'PARTNER_MASTER', 'PARTNER_FINANCE', 'PARTNER_OPS')
  @Post('accounts/:id/change-requests')
  requestChange(@Param('id') accountId: string, @Body() dto: CreateChangeRequestDto) {
    return this.partners.requestChange(accountId, dto);
  }

  @Roles('ADMIN_NOAH', 'SUPPORT_NOAH')
  @Patch('accounts/:id/resolve-change')
  resolveChange(@Param('id') accountId: string, @Body() dto: ResolveChangeDto) {
    return this.partners.resolveChange(accountId, dto);
  }
}
