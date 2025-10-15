import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ImplService } from './impl.service';
import { UpdateImplementationDto } from './impl.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_NOAH', 'SUPPORT_NOAH')
@Controller('impl')
export class ImplController {
  constructor(private readonly impl: ImplService) {}

  @Get()
  findAll() {
    return this.impl.list();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateImplementationDto) {
    return this.impl.update(id, dto);
  }
}
