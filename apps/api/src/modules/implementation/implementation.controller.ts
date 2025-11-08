import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../auth/roles.enum.js';
import { ImplementationService } from './implementation.service.js';
import { ListImplementationTasksDto } from './dto/list-implementation-tasks.dto.js';
import { CreateImplementationTaskDto } from './dto/create-implementation-task.dto.js';
import { ScheduleImplementationTaskDto } from './dto/schedule-implementation-task.dto.js';
import { CompleteImplementationTaskDto } from './dto/complete-implementation-task.dto.js';
import { MarkUnsuccessfulImplementationTaskDto } from './dto/unsuccessful-implementation-task.dto.js';
import { MoveImplementationTaskDto } from './dto/move-implementation-task.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_NOAH, Role.SUPPORT_NOAH)
@Controller('implementation')
export class ImplementationController {
  constructor(private readonly service: ImplementationService) {}

  @Get('tasks')
  list(@Query() query: ListImplementationTasksDto) {
    return this.service.list(query);
  }

  @Post('tasks')
  create(@Body() body: CreateImplementationTaskDto) {
    return this.service.create(body);
  }

  @Patch('tasks/:id/schedule')
  schedule(@Param('id') id: string, @Body() body: ScheduleImplementationTaskDto) {
    return this.service.schedule(id, body);
  }

  @Patch('tasks/:id/complete')
  complete(@Param('id') id: string, @Body() body: CompleteImplementationTaskDto) {
    return this.service.complete(id, body);
  }

  @Patch('tasks/:id/unsuccessful')
  markUnsuccessful(@Param('id') id: string, @Body() body: MarkUnsuccessfulImplementationTaskDto) {
    return this.service.markUnsuccessful(id, body);
  }

  @Patch('tasks/:id/move')
  move(@Param('id') id: string, @Body() body: MoveImplementationTaskDto) {
    return this.service.move(id, body);
  }

  @Get('tasks/:id/events')
  getEvents(@Param('id') id: string) {
    return this.service.getEvents(id);
  }
}
