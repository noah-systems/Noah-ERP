import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Role } from '../enums.js';

@Table({ tableName: 'discount_policies', underscored: true, timestamps: false })
export class DiscountPolicy extends Model<InferAttributes<DiscountPolicy>, InferCreationAttributes<DiscountPolicy, { omit: 'id' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.ENUM(...Object.values(Role)))
  declare role: Role;

  @AllowNull(false)
  @Column({ field: 'max_percent', type: DataType.DECIMAL(5, 2) })
  declare maxPercent: string;
}
