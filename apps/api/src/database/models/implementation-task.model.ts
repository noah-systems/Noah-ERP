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
import { User } from './user.model.js';
import { PartnerAccount } from './partner-account.model.js';
import { ImplementationEvent } from './implementation-event.model.js';

export enum ImplementationTaskStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE',
  UNSUCCESSFUL = 'UNSUCCESSFUL',
}

@Table({ tableName: 'implementation_tasks', underscored: true, timestamps: true })
export class ImplementationTask extends Model<
  InferAttributes<ImplementationTask, { omit: 'assignee' | 'account' | 'events' }>,
  InferCreationAttributes<ImplementationTask, { omit: 'id' | 'createdAt' | 'updatedAt' }>
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
  declare domain: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare segment: string | null;

  @AllowNull(false)
  @Default(ImplementationTaskStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(ImplementationTaskStatus)))
  declare status: ImplementationTaskStatus;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({ field: 'assignee_id', type: DataType.UUID })
  declare assigneeId: string | null;

  @AllowNull(true)
  @Column({ field: 'scheduled_at', type: DataType.DATE })
  declare scheduledAt: Date | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare position: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'created_by_id', type: DataType.UUID })
  declare createdById: string;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @BelongsTo(() => User, 'assigneeId')
  declare assignee?: NonAttribute<User>;

  @BelongsTo(() => PartnerAccount, 'accountId')
  declare account?: NonAttribute<PartnerAccount>;

  @HasMany(() => ImplementationEvent, 'taskId')
  declare events?: NonAttribute<ImplementationEvent[]>;
}
