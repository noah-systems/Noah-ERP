import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { PartnerService } from './partner.service';
import {
  CreateChangeRequestDto,
  CreatePartnerAccountDto,
  CreatePartnerDto,
  ResolveChangeDto,
} from './partner.dto';

@Controller()
export class PartnerController {
  constructor(private readonly partners: PartnerService) {}

  @Post('partners')
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.partners.createPartner(dto);
  }

  @Post('partners/:id/accounts')
  createAccount(@Param('id') partnerId: string, @Body() dto: CreatePartnerAccountDto) {
    return this.partners.createAccount(partnerId, dto);
  }

  @Post('accounts/:id/change-requests')
  requestChange(@Param('id') accountId: string, @Body() dto: CreateChangeRequestDto) {
    return this.partners.requestChange(accountId, dto);
  }

  @Patch('accounts/:id/resolve-change')
  resolveChange(@Param('id') accountId: string, @Body() dto: ResolveChangeDto) {
    return this.partners.resolveChange(accountId, dto);
  }
}
