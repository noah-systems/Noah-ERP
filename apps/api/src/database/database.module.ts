import { Module, OnApplicationShutdown, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { buildSequelizeConfig } from './sequelize.config.js';
import { initLeadModel, Lead } from '../leads/lead.model.js';
import { initOpportunityModel, Opportunity } from '../modules/opps/opportunity.model.js';
import { OPPORTUNITY_STAGES } from '../modules/opps/opportunity.types.js';

export const LEADS_SEQUELIZE = Symbol('LEADS_SEQUELIZE');
export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');
export const OPPORTUNITY_REPOSITORY = Symbol('OPPORTUNITY_REPOSITORY');

class LeadsSequelizeConnection implements OnApplicationShutdown {
  private readonly logger = new Logger('LeadsSequelize');
  public readonly sequelize: Sequelize;

  constructor() {
    const { url, options } = buildSequelizeConfig();
    const config = { ...options, define: { underscored: true, ...(options.define ?? {}) } };
    this.sequelize = url ? new Sequelize(url, config) : new Sequelize(config);
    initLeadModel(this.sequelize);
    initOpportunityModel(this.sequelize);
    this.ensureEnums();
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

  private async ensureEnums() {
    try {
      const enumValues = OPPORTUNITY_STAGES.map((stage) => `'${stage}'`).join(', ');
      await this.sequelize.query(
        `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_opportunities_stage') THEN CREATE TYPE "enum_opportunities_stage" AS ENUM (${enumValues}); END IF; END $$;`,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to ensure opportunities enum: ${reason}`);
    }
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
    {
      provide: OPPORTUNITY_REPOSITORY,
      useFactory: (connection: LeadsSequelizeConnection) =>
        connection.sequelize.model('Opportunity') as typeof Opportunity,
      inject: [LeadsSequelizeConnection],
    },
  ],
  exports: [LEADS_SEQUELIZE, LEAD_REPOSITORY, OPPORTUNITY_REPOSITORY],
})
export class DatabaseModule {}
