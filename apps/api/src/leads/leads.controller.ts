import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/auth/jwt.guard.js';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto, LeadsQueryDto, MoveLeadDto, UpdateLeadDto } from './leads.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  findAll(@Query() query: LeadsQueryDto) {
    return this.leads.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(id, dto);
  }

  @Patch(':id/status')
  move(@Param('id') id: string, @Body() dto: MoveLeadDto) {
    return this.leads.move(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leads.remove(id);
  }
}
