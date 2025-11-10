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
import { Opportunity } from './opportunity.model.js';
import { PartnerAccount } from './partner-account.model.js';

@Table({ tableName: 'hosting_providers', underscored: true, timestamps: false })
export class HostingProvider extends Model<InferAttributes<HostingProvider, { omit: 'opportunities' | 'accounts' }>, InferCreationAttributes<HostingProvider, { omit: 'id' }>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @HasMany(() => Opportunity, 'hostingId')
  declare opportunities?: NonAttribute<Opportunity[]>;

  @HasMany(() => PartnerAccount, 'hostingId')
  declare accounts?: NonAttribute<PartnerAccount[]>;
}
