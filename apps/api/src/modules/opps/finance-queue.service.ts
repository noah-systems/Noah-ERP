import { Injectable, Logger } from '@nestjs/common';

function normalizeBaseUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, '');
}

@Injectable()
export class FinanceQueueService {
  private readonly logger = new Logger(FinanceQueueService.name);
  private readonly baseUrl: string | null;

  constructor() {
    const candidates = [
      process.env.FINANCE_SERVICE_URL,
      process.env.FINANCE_QUEUE_BASE_URL,
      process.env.INTERNAL_API_URL,
      process.env.API_INTERNAL_URL,
      process.env.API_BASE_URL,
      process.env.API_URL,
    ];

    const fromEnv = candidates.map(normalizeBaseUrl).find((value) => value);
    if (!fromEnv && process.env.API_PORT) {
      this.baseUrl = `http://localhost:${process.env.API_PORT}`;
    } else if (!fromEnv && process.env.PORT) {
      this.baseUrl = `http://localhost:${process.env.PORT}`;
    } else {
      this.baseUrl = fromEnv ?? null;
    }
  }

  async enqueueFromOpportunity(opportunityId: string): Promise<void> {
    if (!this.baseUrl || typeof fetch !== 'function') {
      this.logger.debug('Finance queue base URL not configured. Skipping trigger.');
      return;
    }

    const url = `${this.baseUrl}/finance/queue/from-opportunity/${opportunityId}`;
    try {
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok && response.status !== 404 && response.status !== 501) {
        const body = await response.text().catch(() => '');
        this.logger.warn(
          `Finance queue responded with ${response.status} ${response.statusText}: ${body.slice(0, 200)}`,
        );
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to notify finance queue: ${reason}`);
    }
  }
}
