import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model.js';
import { Lead } from './models/lead.model.js';
import { LeadStatus } from './models/lead-status.model.js';
import { Opportunity } from './models/opportunity.model.js';
import { OpportunityStage } from './models/opportunity-stage.model.js';
import { OppHistory } from './models/opp-history.model.js';
import { HostingProvider } from './models/hosting-provider.model.js';
import { CanceledSale } from './models/canceled-sale.model.js';
import { Partner } from './models/partner.model.js';
import { PartnerAccount } from './models/partner-account.model.js';
import { PartnerChangeRequest } from './models/partner-change-request.model.js';
import { PriceItem } from './models/price-item.model.js';
import { PriceTier } from './models/price-tier.model.js';
import { DiscountPolicy } from './models/discount-policy.model.js';
import { ImplementationTask } from './models/implementation-task.model.js';
import { ImplementationEvent } from './models/implementation-event.model.js';

const modelList = [
  User,
  Lead,
  LeadStatus,
  Opportunity,
  OpportunityStage,
  OppHistory,
  HostingProvider,
  CanceledSale,
  Partner,
  PartnerAccount,
  PartnerChangeRequest,
  PriceItem,
  PriceTier,
  DiscountPolicy,
  ImplementationTask,
  ImplementationEvent,
] as const;

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (url) {
    return url;
  }

  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  if (nodeEnv !== 'production') {
    return 'postgresql://postgres@localhost:5432/postgres';
  }

  throw new Error('DATABASE_URL environment variable is required');
}

export const sequelize = new Sequelize(resolveDatabaseUrl(), {
  dialect: 'postgres',
  logging: false,
});

sequelize.addModels([...modelList]);

export const models = modelList;

export type DatabaseModels = typeof modelList[number];

export async function ensureDatabaseConnection(): Promise<void> {
  await sequelize.authenticate();
}
