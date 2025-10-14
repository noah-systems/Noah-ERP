import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadStatusDto,
} from './leads.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  findAll() {
    return this.leads.list();
  }

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.leads.updateStatus(id, dto);
  }
}
