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

@Table({ tableName: 'canceled_sales', underscored: true, timestamps: false })
export class CanceledSale extends Model<InferAttributes<CanceledSale, { omit: 'opportunity' }>, InferCreationAttributes<CanceledSale, { omit: 'id' | 'reason' | 'summary' | 'createdAt' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Opportunity)
  @AllowNull(false)
  @Column({ field: 'opp_id', type: DataType.UUID })
  declare oppId: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare reason: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare summary: string | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @BelongsTo(() => Opportunity, 'oppId')
  declare opportunity?: NonAttribute<Opportunity>;
}
