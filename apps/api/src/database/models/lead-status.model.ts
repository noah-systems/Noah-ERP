import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Lead } from './lead.model.js';

@Table({ tableName: 'lead_statuses', underscored: true, timestamps: true })
export class LeadStatus extends Model<InferAttributes<LeadStatus, { omit: 'leads' }>, InferCreationAttributes<LeadStatus, { omit: 'id' | 'createdAt' | 'updatedAt' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Default('#000000')
  @Column(DataType.STRING)
  declare color: string;

  @AllowNull(false)
  @Default(false)
  @Column({ field: 'tmk_reason_required', type: DataType.BOOLEAN })
  declare tmkReasonRequired: boolean;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @HasMany(() => Lead, 'statusId')
  declare leads?: NonAttribute<Lead[]>;
}
