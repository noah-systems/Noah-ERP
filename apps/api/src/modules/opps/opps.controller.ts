import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OppsService } from './opps.service.js';
import {
  CreateOpportunityDto,
  MarkOpportunityLostDto,
  UpdateOppStageDto,
  UpdateOpportunityDto,
} from './opps.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../auth/roles.enum.js';
import { FinanceQueueService } from './finance-queue.service.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_NOAH, Role.SELLER)
@Controller('opps')
export class OppsController {
  constructor(
    private readonly opps: OppsService,
    private readonly financeQueue: FinanceQueueService,
  ) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.opps.listGrouped(q);
  }

  @Post()
  create(@Body() dto: CreateOpportunityDto) {
    return this.opps.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.opps.update(id, dto);
  }

  @Patch(':id/stage')
  async move(@Param('id') id: string, @Body() dto: UpdateOppStageDto) {
    const opp = await this.opps.move(id, dto.stage);
    if (dto.stage === 'WON') {
      await this.financeQueue.enqueueFromOpportunity(id);
    }
    return opp;
  }

  @Post(':id/lost')
  lost(@Param('id') id: string, @Body() dto: MarkOpportunityLostDto) {
    return this.opps.markLost(id, dto.reason);
  }
}
