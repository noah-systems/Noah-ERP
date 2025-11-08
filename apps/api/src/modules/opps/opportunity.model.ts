import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import type { OpportunityStage } from './opportunity.types.js';

export interface OpportunityAttributes {
  id: string;
  companyName: string;
  cnpj: string | null;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  financeEmail: string | null;
  financePhone: string | null;
  subdomain: string | null;
  amount: string | number;
  stage: OpportunityStage;
  trialEndsAt: Date | null;
  ownerId: string;
  tags: string[] | null;
  lostReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type OpportunityCreationAttributes = Optional<
  OpportunityAttributes,
  | 'id'
  | 'cnpj'
  | 'contactEmail'
  | 'contactPhone'
  | 'financeEmail'
  | 'financePhone'
  | 'subdomain'
  | 'tags'
  | 'trialEndsAt'
  | 'lostReason'
  | 'createdAt'
  | 'updatedAt'
>;

export class Opportunity
  extends Model<OpportunityAttributes, OpportunityCreationAttributes>
  implements OpportunityAttributes
{
  declare id: string;
  declare companyName: string;
  declare cnpj: string | null;
  declare contactName: string;
  declare contactEmail: string | null;
  declare contactPhone: string | null;
  declare financeEmail: string | null;
  declare financePhone: string | null;
  declare subdomain: string | null;
  declare amount: string | number;
  declare stage: OpportunityStage;
  declare trialEndsAt: Date | null;
  declare ownerId: string;
  declare tags: string[] | null;
  declare lostReason: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export interface OpportunityJSON {
  id: string;
  companyName: string;
  cnpj: string | null;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  financeEmail: string | null;
  financePhone: string | null;
  subdomain: string | null;
  amount: number;
  stage: OpportunityStage;
  trialEndsAt: string | null;
  ownerId: string;
  tags: string[];
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export function initOpportunityModel(sequelize: Sequelize): typeof Opportunity {
  Opportunity.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'company_name',
      },
      cnpj: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contact_name',
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_email',
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_phone',
      },
      financeEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'finance_email',
      },
      financePhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'finance_phone',
      },
      subdomain: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: '0.00',
      },
      stage: {
        type: DataTypes.ENUM(
          'NEGOTIATION',
          'PRESENTATION',
          'PROPOSAL',
          'TRIAL',
          'TRIAL_EXPIRING',
          'WON',
          'LOST',
        ),
        allowNull: false,
        defaultValue: 'NEGOTIATION',
      },
      trialEndsAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'trial_ends_at',
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'owner_id',
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      lostReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'lost_reason',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'opportunities',
      modelName: 'Opportunity',
      underscored: true,
      indexes: [
        { fields: ['stage'] },
        { fields: ['company_name'] },
        { fields: ['owner_id'] },
      ],
    },
  );

  return Opportunity;
}

export function toOpportunityJSON(model: Opportunity): OpportunityJSON {
  const plain = model.get({ plain: true }) as OpportunityAttributes;

  const amountNumber = typeof plain.amount === 'string' ? Number.parseFloat(plain.amount) : plain.amount;

  return {
    id: plain.id,
    companyName: plain.companyName,
    cnpj: plain.cnpj ?? null,
    contactName: plain.contactName,
    contactEmail: plain.contactEmail ?? null,
    contactPhone: plain.contactPhone ?? null,
    financeEmail: plain.financeEmail ?? null,
    financePhone: plain.financePhone ?? null,
    subdomain: plain.subdomain ?? null,
    amount: Number.isFinite(amountNumber) ? amountNumber : 0,
    stage: plain.stage,
    trialEndsAt: plain.trialEndsAt ? plain.trialEndsAt.toISOString() : null,
    ownerId: plain.ownerId,
    tags: Array.isArray(plain.tags) ? plain.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    lostReason: plain.lostReason ?? null,
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}
