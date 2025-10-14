import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ImplService } from './impl.service';
import { UpdateImplementationDto } from './impl.dto';

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
