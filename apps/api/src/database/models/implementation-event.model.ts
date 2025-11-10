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
import { ImplementationTask } from './implementation-task.model.js';
import { User } from './user.model.js';

export enum ImplementationEventType {
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE',
  UNSUCCESSFUL = 'UNSUCCESSFUL',
  COMMENT = 'COMMENT',
}

@Table({ tableName: 'implementation_events', underscored: true, timestamps: false })
export class ImplementationEvent extends Model<
  InferAttributes<ImplementationEvent, { omit: 'task' }>,
  InferCreationAttributes<ImplementationEvent, { omit: 'id' | 'createdAt' }>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => ImplementationTask)
  @AllowNull(false)
  @Column({ field: 'task_id', type: DataType.UUID })
  declare taskId: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(ImplementationEventType)))
  declare type: ImplementationEventType;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare payload: Record<string, unknown> | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'created_by_id', type: DataType.UUID })
  declare createdById: string;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @BelongsTo(() => ImplementationTask, 'taskId')
  declare task?: NonAttribute<ImplementationTask>;

  @BelongsTo(() => User, 'createdById')
  declare createdBy?: NonAttribute<User>;
}
