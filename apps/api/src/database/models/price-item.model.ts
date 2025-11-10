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
import { Channel, ItemKind } from '../enums.js';

@Table({ tableName: 'price_items', underscored: true, timestamps: false })
export class PriceItem extends Model<InferAttributes<PriceItem>, InferCreationAttributes<PriceItem, { omit: 'id' | 'active' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare sku: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  declare price: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Channel)))
  declare channel: Channel;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(ItemKind)))
  declare kind: ItemKind;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;
}
