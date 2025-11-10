import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Channel } from '../enums.js';

@Table({ tableName: 'price_tiers', underscored: true, timestamps: false })
export class PriceTier extends Model<
  InferAttributes<PriceTier>,
  InferCreationAttributes<PriceTier, { omit: 'id' }>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Channel)))
  declare channel: Channel;

  @AllowNull(false)
  @Column({ field: 'min_users', type: DataType.INTEGER })
  declare minUsers: number;

  @AllowNull(true)
  @Column({ field: 'max_users', type: DataType.INTEGER })
  declare maxUsers: number | null;

  @AllowNull(false)
  @Column({ field: 'price_per_user', type: DataType.DECIMAL(10, 2) })
  declare pricePerUser: string;
}
