import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { PartnerAccount } from './partner-account.model.js';

@Table({ tableName: 'partners', underscored: true, timestamps: false })
export class Partner extends Model<
  InferAttributes<Partner, { omit: 'accounts' }>,
  InferCreationAttributes<Partner, { omit: 'id' }>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column({ field: 'nickname', type: DataType.STRING })
  declare nickname: string;

  @AllowNull(false)
  @Column({ field: 'legal_name', type: DataType.STRING })
  declare legalName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare cnpj: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare address: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare domain: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare contact: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare whatsapp: string | null;

  @AllowNull(true)
  @Column({ field: 'finance_email', type: DataType.STRING })
  declare financeEmail: string | null;

  @AllowNull(true)
  @Column({ field: 'price_table', type: DataType.JSONB })
  declare priceTable: Record<string, unknown> | null;

  @HasMany(() => PartnerAccount, 'partnerId')
  declare accounts?: NonAttribute<PartnerAccount[]>;
}
