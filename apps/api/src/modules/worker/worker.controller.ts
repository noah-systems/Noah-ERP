import { Controller, Get } from '@nestjs/common';
import { WorkerService } from './worker.service.js';

@Controller('worker')
export class WorkerController {
  constructor(private readonly worker: WorkerService) {}
  @Get('health') health() { return this.worker.health(); }
}
