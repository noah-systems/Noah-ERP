import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../auth/roles.enum.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_NOAH, Role.SUPPORT_NOAH, Role.SELLER)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list() {
    return this.leads.list();
  }

  @Post()
  create(@Body() dto: CreateLeadDto) { return this.leads.create(dto); }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.updateStatus(id, dto);
  }
}
