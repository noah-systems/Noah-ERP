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
import { PartnerAccount } from './partner-account.model.js';

@Table({ tableName: 'partner_change_requests', underscored: true, timestamps: false })
export class PartnerChangeRequest extends Model<
  InferAttributes<PartnerChangeRequest, { omit: 'account' }>,
  InferCreationAttributes<PartnerChangeRequest, { omit: 'id' | 'createdAt' }>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => PartnerAccount)
  @AllowNull(false)
  @Column({ field: 'account_id', type: DataType.UUID })
  declare accountId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare type: string;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare payload: Record<string, unknown> | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @BelongsTo(() => PartnerAccount, 'accountId')
  declare account?: NonAttribute<PartnerAccount>;
}
