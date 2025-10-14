import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, JobsOptions, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

type JobName = 'trial-dminus5' | 'trial-end';

@Injectable()
export class WorkerService implements OnModuleInit {
  private queue!: Queue;
  private worker!: Worker;

  onModuleInit() {
    const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.queue = new Queue('noah', { connection });
    this.worker = new Worker(
      'noah',
      async (job: Job<any, any, JobName>) => {
        if (job.name === 'trial-dminus5') {
          return;
        }
        if (job.name === 'trial-end') {
          return;
        }
      },
      { connection }
    );
  }

  async enqueue(name: JobName, data: any, delayMs?: number) {
    const options: JobsOptions = {};
    if (delayMs && delayMs > 0) {
      options.delay = delayMs;
    }
    await this.queue.add(name, data, options);
  }

  health() {
    return { ok: true };
  }
}
