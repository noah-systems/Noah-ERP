import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OppsService } from './opps.service.js';
import {
  ApplyPricingDto,
  CreateOpportunityDto,
  MarkOpportunityLostDto,
  UpdateOppStageDto,
} from './opps.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../auth/roles.enum.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_NOAH, Role.SELLER)
@Controller('opps')
export class OppsController {
  constructor(private readonly opps: OppsService) {}

  @Get()
  findAll() {
    return this.opps.list();
  }

  @Post()
  create(@Body() dto: CreateOpportunityDto) {
    return this.opps.create(dto);
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() dto: UpdateOppStageDto) {
    return this.opps.updateStage(id, dto);
  }

  @Post(':id/pricing')
  @Roles(Role.ADMIN_NOAH)
  applyPricing(@Param('id') id: string, @Body() dto: ApplyPricingDto) {
    return this.opps.applyPricing(id, dto);
  }

  @Post(':id/lost')
  markLost(@Param('id') id: string, @Body() dto: MarkOpportunityLostDto) {
    return this.opps.markLost(id, dto);
  }
}
