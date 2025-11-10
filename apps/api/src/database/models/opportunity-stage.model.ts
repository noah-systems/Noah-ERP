import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Opportunity } from './opportunity.model.js';
import { OppHistory } from './opp-history.model.js';

@Table({ tableName: 'opportunity_stages', underscored: true, timestamps: false })
export class OpportunityStage extends Model<InferAttributes<OpportunityStage, { omit: 'opportunities' | 'historyFrom' | 'historyTo' }>, InferCreationAttributes<OpportunityStage, { omit: 'id' | 'order' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare order: number;

  @AllowNull(false)
  @Default(false)
  @Column({ field: 'lost_reason_required', type: DataType.BOOLEAN })
  declare lostReasonRequired: boolean;

  @HasMany(() => Opportunity, 'stageId')
  declare opportunities?: NonAttribute<Opportunity[]>;

  @HasMany(() => OppHistory, 'fromStageId')
  declare historyFrom?: NonAttribute<OppHistory[]>;

  @HasMany(() => OppHistory, 'toStageId')
  declare historyTo?: NonAttribute<OppHistory[]>;
}
