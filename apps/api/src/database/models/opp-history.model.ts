import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Opportunity } from './opportunity.model.js';
import { OpportunityStage } from './opportunity-stage.model.js';
import { User } from './user.model.js';

@Table({ tableName: 'opportunity_history', underscored: true, timestamps: false })
export class OppHistory extends Model<InferAttributes<OppHistory, { omit: 'opp' | 'actor' | 'fromStage' | 'toStage' }>, InferCreationAttributes<OppHistory, { omit: 'id' | 'fromStageId' | 'toStageId' | 'note' | 'createdAt' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Opportunity)
  @AllowNull(false)
  @Column({ field: 'opp_id', type: DataType.UUID })
  declare oppId: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'actor_id', type: DataType.UUID })
  declare actorId: string;

  @ForeignKey(() => OpportunityStage)
  @AllowNull(true)
  @Column({ field: 'from_stage_id', type: DataType.UUID })
  declare fromStageId: string | null;

  @ForeignKey(() => OpportunityStage)
  @AllowNull(true)
  @Column({ field: 'to_stage_id', type: DataType.UUID })
  declare toStageId: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare note: string | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @BelongsTo(() => Opportunity, 'oppId')
  declare opp?: NonAttribute<Opportunity>;

  @BelongsTo(() => User, 'actorId')
  declare actor?: NonAttribute<User>;

  @BelongsTo(() => OpportunityStage, 'fromStageId')
  declare fromStage?: NonAttribute<OpportunityStage>;

  @BelongsTo(() => OpportunityStage, 'toStageId')
  declare toStage?: NonAttribute<OpportunityStage>;
}
