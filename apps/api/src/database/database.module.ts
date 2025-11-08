import { Module, OnApplicationShutdown, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { buildSequelizeConfig } from './sequelize.config.js';
import { initLeadModel, Lead } from '../leads/lead.model.js';

export const LEADS_SEQUELIZE = Symbol('LEADS_SEQUELIZE');
export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');

class LeadsSequelizeConnection implements OnApplicationShutdown {
  private readonly logger = new Logger('LeadsSequelize');
  public readonly sequelize: Sequelize;

  constructor() {
    const { url, options } = buildSequelizeConfig();
    this.sequelize = url ? new Sequelize(url, options) : new Sequelize(options);
    initLeadModel(this.sequelize);
    void this.bootstrap();
  }

  private async bootstrap() {
    try {
      await this.sequelize.authenticate();
      this.logger.log('Leads database connection established.');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to leads database: ${reason}`);
    }
  }

  async onApplicationShutdown() {
    await this.sequelize.close().catch((error) => {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to close leads database connection: ${reason}`);
    });
  }
}

@Module({
  providers: [
    LeadsSequelizeConnection,
    {
      provide: LEADS_SEQUELIZE,
      useFactory: (connection: LeadsSequelizeConnection) => connection.sequelize,
      inject: [LeadsSequelizeConnection],
    },
    {
      provide: LEAD_REPOSITORY,
      useFactory: (connection: LeadsSequelizeConnection) =>
        connection.sequelize.model('Lead') as typeof Lead,
      inject: [LeadsSequelizeConnection],
    },
  ],
  exports: [LEADS_SEQUELIZE, LEAD_REPOSITORY],
})
export class DatabaseModule {}
