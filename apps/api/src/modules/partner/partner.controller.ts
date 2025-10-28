import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service.js';
import {
  CreateChangeRequestDto,
  CreatePartnerAccountDto,
  CreatePartnerDto,
  ResolveChangeDto,
} from './partner.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../auth/roles.enum.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PartnerController {
  constructor(private readonly partners: PartnerService) {}

  @Roles(Role.ADMIN_NOAH)
  @Post('partners')
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.partners.createPartner(dto);
  }

  @Roles(Role.ADMIN_NOAH, Role.PARTNER_MASTER, Role.PARTNER_OPS)
  @Post('partners/:id/accounts')
  createAccount(@Param('id') partnerId: string, @Body() dto: CreatePartnerAccountDto) {
    return this.partners.createAccount(partnerId, dto);
  }

  @Roles(Role.ADMIN_NOAH, Role.PARTNER_MASTER, Role.PARTNER_FINANCE, Role.PARTNER_OPS)
  @Post('accounts/:id/change-requests')
  requestChange(@Param('id') accountId: string, @Body() dto: CreateChangeRequestDto) {
    return this.partners.requestChange(accountId, dto);
  }

  @Roles(Role.ADMIN_NOAH, Role.SUPPORT_NOAH)
  @Patch('accounts/:id/resolve-change')
  resolveChange(@Param('id') accountId: string, @Body() dto: ResolveChangeDto) {
    return this.partners.resolveChange(accountId, dto);
  }
}
