import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class WorkerService {
  private connection = new IORedis(process.env.REDIS_URL || 'redis://redis:6379');
  private trialQueue = new Queue('trial', { connection: this.connection });

  async enqueue(queueName: string, jobName: string, payload: any, delayMs?: number): Promise<void> {
    if (queueName === 'trial') {
      await this.trialQueue.add(jobName, payload, delayMs ? { delay: delayMs } : {});
      return;
    }
  }

  health() { return { ok: true }; }
}
