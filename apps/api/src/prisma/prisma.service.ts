import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private shutdownHooksRegistered = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to the database.');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to the database on startup.');
      this.logger.error(`Check DATABASE_URL and database credentials: ${reason}`);
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

    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
