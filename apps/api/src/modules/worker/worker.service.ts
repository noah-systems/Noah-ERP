import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue, QueueScheduler, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '../../prisma.service';

interface TrialJobPayload {
  opportunityId: string;
}

@Injectable()
export class WorkerService implements OnModuleDestroy {
  private readonly connection: IORedis;
  private readonly trialQueue: Queue<TrialJobPayload>;
  private readonly trialScheduler: QueueScheduler;
  private readonly worker: Worker<TrialJobPayload>;

  constructor(private readonly db: PrismaService) {
    const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
    this.connection = new IORedis(redisUrl);
    this.trialQueue = new Queue<TrialJobPayload>('trial-lifecycle', {
      connection: this.connection,
    });
    this.trialScheduler = new QueueScheduler('trial-lifecycle', {
      connection: this.connection,
    });
    this.trialScheduler.waitUntilReady().catch(() => undefined);
    this.worker = new Worker<TrialJobPayload>(
      'trial-lifecycle',
      (job) => this.handleTrialJob(job),
      { connection: this.connection },
    );
  }

  async queueTrialLifecycle(opportunityId: string, trialStart: Date) {
    const now = Date.now();
    const startTime = trialStart.getTime();
    const dMinusFive = startTime + 2 * 24 * 60 * 60 * 1000; // 7-day trial -> trigger 2 days after start (D-5)
    const trialEnd = startTime + 7 * 24 * 60 * 60 * 1000;

    await this.trialQueue.add(
      'TRIAL_D_MINUS_5',
      { opportunityId },
      { delay: Math.max(dMinusFive - now, 0), removeOnComplete: true, removeOnFail: true },
    );
    await this.trialQueue.add(
      'TRIAL_END',
      { opportunityId },
      { delay: Math.max(trialEnd - now, 0), removeOnComplete: true, removeOnFail: true },
    );
  }

  health() {
    return {
      queue: this.trialQueue.name,
      isRunning: this.worker.isRunning(),
    };
  }

  private async handleTrialJob(job: Job<TrialJobPayload>) {
    const { opportunityId } = job.data;
    if (!opportunityId) return;
    if (job.name === 'TRIAL_D_MINUS_5') {
      await this.moveOpportunityStage(opportunityId, 'Vencimento Trial', 'Auto stage D-5');
    }
    if (job.name === 'TRIAL_END') {
      await this.moveOpportunityStage(opportunityId, 'Vencimento Trial', 'Trial ended');
    }
  }

  private async moveOpportunityStage(opportunityId: string, stageName: string, note: string) {
    const stage = await this.db.opportunityStage.findFirst({ where: { name: stageName } });
    if (!stage) return;
    const opp = await this.db.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opp) return;
    if (opp.stageId === stage.id) return;
    await this.db.$transaction(async (tx) => {
      await tx.opportunity.update({
        where: { id: opportunityId },
        data: { stageId: stage.id },
      });
      await tx.oppHistory.create({
        data: {
          oppId: opportunityId,
          actorId: null,
          fromStage: opp.stageId,
          toStage: stage.id,
          note,
        },
      });
    });
  }

  async onModuleDestroy() {
    await Promise.all([
      this.worker.close(),
      this.trialScheduler.close(),
      this.trialQueue.close(),
      this.connection.quit(),
    ]);
  }
}
