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
import { Role } from '../enums.js';
import { Lead } from './lead.model.js';
import { Opportunity } from './opportunity.model.js';
import { OppHistory } from './opp-history.model.js';
import { ImplementationTask } from './implementation-task.model.js';

@Table({ tableName: 'users', underscored: true, timestamps: true })
export class User extends Model<InferAttributes<User, { omit: 'leads' | 'opportunities' | 'histories' | 'implementationTasks' }>, InferCreationAttributes<User, { omit: 'id' | 'role' | 'createdAt' | 'updatedAt' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Column({ field: 'password_hash', type: DataType.STRING })
  declare passwordHash: string;

  @AllowNull(false)
  @Default(Role.SELLER)
  @Column(DataType.ENUM(...Object.values(Role)))
  declare role: Role;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @HasMany(() => Lead, 'ownerId')
  declare leads?: NonAttribute<Lead[]>;

  @HasMany(() => Opportunity, 'ownerId')
  declare opportunities?: NonAttribute<Opportunity[]>;

  @HasMany(() => OppHistory, 'actorId')
  declare histories?: NonAttribute<OppHistory[]>;

  @HasMany(() => ImplementationTask, 'assigneeId')
  declare implementationTasks?: NonAttribute<ImplementationTask[]>;
}
