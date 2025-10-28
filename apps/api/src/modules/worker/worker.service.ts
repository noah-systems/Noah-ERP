import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, JobsOptions, Queue, Worker } from 'bullmq';
import { Redis as IORedis } from 'ioredis';
import { resolveRedisUrl } from '../../redis/redis.config.js';

type JobName = 'trial-dminus5' | 'trial-end';

@Injectable()
export class WorkerService implements OnModuleInit {
  private queue!: Queue<any, any, JobName>;
  private worker!: Worker<any, any, JobName>;

  onModuleInit() {
    const url = resolveRedisUrl();
    const connection = new IORedis(url, {
      // BullMQ requires disabling the retry mechanism for blocking commands.
      // See https://docs.bullmq.io/guide/retrying#livelock for details.
      maxRetriesPerRequest: null,
    });
    this.queue = new Queue<any, any, JobName>('noah', { connection });
    this.worker = new Worker<any, any, JobName>(
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
