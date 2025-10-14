import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OppsService } from './opps.service';
import {
  ApplyPricingDto,
  CreateOpportunityDto,
  MarkOpportunityLostDto,
  UpdateOppStageDto,
} from './opps.dto';

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
  applyPricing(@Param('id') id: string, @Body() dto: ApplyPricingDto) {
    return this.opps.applyPricing(id, dto);
  }

  @Post(':id/lost')
  markLost(@Param('id') id: string, @Body() dto: MarkOpportunityLostDto) {
    return this.opps.markLost(id, dto);
  }
}
