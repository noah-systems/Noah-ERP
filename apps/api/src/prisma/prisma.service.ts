import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const TRUTHY_STRINGS = new Set(['1', 'true', 'yes', 'y', 'on']);
const FALSY_STRINGS = new Set(['0', 'false', 'no', 'n', 'off']);

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (TRUTHY_STRINGS.has(normalized)) {
    return true;
  }

  if (FALSY_STRINGS.has(normalized)) {
    return false;
  }

  return undefined;
}

function shouldAllowMissingDatabase(): boolean {
  const override =
    parseBoolean(process.env.NOAH_ALLOW_MISSING_DATABASE) ??
    parseBoolean(process.env.ALLOW_MISSING_DATABASE);

  if (override !== undefined) {
    return override;
  }

  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  return nodeEnv !== 'production';
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private shutdownHooksRegistered = false;

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to the database.');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to the database on startup.');
      this.logger.error(`Check DATABASE_URL and database credentials: ${reason}`);

      if (shouldAllowMissingDatabase()) {
        this.logger.warn(
          'Continuing without an active database connection. Prisma queries will fail until the database is reachable.',
        );
        return;
      }

      // Throwing the error ensures the NestJS bootstrap fails with exit code 1 so
      // process managers (PM2/systemd) can restart the service once the database is available.
      throw error instanceof Error ? error : new Error(reason);
    }
  }
  enableShutdownHooks(app: INestApplication): void {
    if (this.shutdownHooksRegistered) {
      return;
    }

    this.shutdownHooksRegistered = true;

    process.on('beforeExit', () => {
      app.close().catch((error) => {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to close the application on shutdown: ${reason}`);
      });
    });
  }
}
