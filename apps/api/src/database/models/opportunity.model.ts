import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Lead } from './lead.model.js';
import { OpportunityStage } from './opportunity-stage.model.js';
import { HostingProvider } from './hosting-provider.model.js';
import { User } from './user.model.js';
import { OppHistory } from './opp-history.model.js';

export enum OpportunityStageValue {
  NEGOTIATION = 'NEGOTIATION',
  PRESENTATION = 'PRESENTATION',
  PROPOSAL = 'PROPOSAL',
  TRIAL = 'TRIAL',
  TRIAL_EXPIRING = 'TRIAL_EXPIRING',
  WON = 'WON',
  LOST = 'LOST',
}

@Table({ tableName: 'opportunities', underscored: true, timestamps: true })
export class Opportunity extends Model<InferAttributes<Opportunity, { omit: 'owner' | 'lead' | 'stageRef' | 'hosting' | 'history' }>, InferCreationAttributes<Opportunity, { omit: 'id' | 'cnpj' | 'contactEmail' | 'contactPhone' | 'financeEmail' | 'financePhone' | 'subdomain' | 'tags' | 'trialEndsAt' | 'lostReason' | 'leadId' | 'hostingId' | 'createdAt' | 'updatedAt' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'company_name', type: DataType.STRING })
  declare companyName: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare cnpj: string | null;

  @AllowNull(false)
  @Column({ field: 'contact_name', type: DataType.STRING })
  declare contactName: string;

  @AllowNull(true)
  @Column({ field: 'contact_email', type: DataType.STRING })
  declare contactEmail: string | null;

  @AllowNull(true)
  @Column({ field: 'contact_phone', type: DataType.STRING })
  declare contactPhone: string | null;

  @AllowNull(true)
  @Column({ field: 'finance_email', type: DataType.STRING })
  declare financeEmail: string | null;

  @AllowNull(true)
  @Column({ field: 'finance_phone', type: DataType.STRING })
  declare financePhone: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare subdomain: string | null;

  @AllowNull(false)
  @Default('0.00')
  @Column(DataType.DECIMAL(12, 2))
  declare amount: string;

  @AllowNull(false)
  @Default(OpportunityStageValue.NEGOTIATION)
  @Column(DataType.ENUM(...Object.values(OpportunityStageValue)))
  declare stage: OpportunityStageValue;

  @AllowNull(true)
  @Column({ field: 'trial_ends_at', type: DataType.DATE })
  declare trialEndsAt: Date | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'owner_id', type: DataType.UUID })
  declare ownerId: string;

  @ForeignKey(() => Lead)
  @AllowNull(true)
  @Column({ field: 'lead_id', type: DataType.UUID })
  declare leadId: string | null;

  @ForeignKey(() => OpportunityStage)
  @AllowNull(true)
  @Column({ field: 'stage_id', type: DataType.UUID })
  declare stageId: string | null;

  @ForeignKey(() => HostingProvider)
  @AllowNull(true)
  @Column({ field: 'hosting_id', type: DataType.UUID })
  declare hostingId: string | null;

  @AllowNull(false)
  @Default([])
  @Column(DataType.JSONB)
  declare tags: string[];

  @AllowNull(true)
  @Column({ field: 'lost_reason', type: DataType.TEXT })
  declare lostReason: string | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @BelongsTo(() => User, 'ownerId')
  declare owner?: NonAttribute<User>;

  @BelongsTo(() => Lead, 'leadId')
  declare lead?: NonAttribute<Lead>;

  @BelongsTo(() => OpportunityStage, 'stageId')
  declare stageRef?: NonAttribute<OpportunityStage>;

  @BelongsTo(() => HostingProvider, 'hostingId')
  declare hosting?: NonAttribute<HostingProvider>;

  @HasMany(() => OppHistory, 'oppId')
  declare history?: NonAttribute<OppHistory[]>;
}
