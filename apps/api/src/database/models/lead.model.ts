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
  UpdatedAt,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { LeadStatus } from './lead-status.model.js';
import { User } from './user.model.js';

export enum LeadStatusValue {
  NURTURING = 'NURTURING',
  QUALIFIED = 'QUALIFIED',
  DISQUALIFIED = 'DISQUALIFIED',
}

@Table({ tableName: 'leads', underscored: true, timestamps: true })
export class Lead extends Model<InferAttributes<Lead, { omit: 'owner' | 'statusRef' }>, InferCreationAttributes<Lead, { omit: 'id' | 'segment' | 'employeesCount' | 'contactName' | 'phone' | 'email' | 'source' | 'status' | 'ownerId' | 'statusId' | 'notes' | 'createdAt' | 'updatedAt' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'company_name', type: DataType.STRING })
  declare companyName: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare segment: string | null;

  @AllowNull(true)
  @Column({ field: 'employees_count', type: DataType.INTEGER })
  declare employeesCount: number | null;

  @AllowNull(true)
  @Column({ field: 'contact_name', type: DataType.STRING })
  declare contactName: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare phone: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare email: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare source: string | null;

  @AllowNull(false)
  @Default(LeadStatusValue.NURTURING)
  @Column({ field: 'status', type: DataType.ENUM(...Object.values(LeadStatusValue)) })
  declare status: LeadStatusValue;

  @ForeignKey(() => LeadStatus)
  @AllowNull(true)
  @Column({ field: 'status_id', type: DataType.UUID })
  declare statusId: string | null;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({ field: 'owner_id', type: DataType.UUID })
  declare ownerId: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @BelongsTo(() => User, 'ownerId')
  declare owner?: NonAttribute<User>;

  @BelongsTo(() => LeadStatus, 'statusId')
  declare statusRef?: NonAttribute<LeadStatus>;
}

export const LEAD_STATUSES = Object.values(LeadStatusValue);
