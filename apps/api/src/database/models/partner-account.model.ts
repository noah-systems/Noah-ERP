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
import { PartnerAccountStatus } from '../enums.js';
import { Partner } from './partner.model.js';
import { HostingProvider } from './hosting-provider.model.js';
import { PartnerChangeRequest } from './partner-change-request.model.js';

@Table({ tableName: 'partner_accounts', underscored: true, timestamps: true })
export class PartnerAccount extends Model<
  InferAttributes<PartnerAccount, { omit: 'partner' | 'hosting' | 'changeRequests' }>,
  InferCreationAttributes<PartnerAccount, { omit: 'id' | 'note' | 'activatedAt' | 'createdAt' | 'updatedAt' }>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Partner)
  @AllowNull(false)
  @Column({ field: 'partner_id', type: DataType.UUID })
  declare partnerId: string;

  @AllowNull(false)
  @Column({ field: 'legal_name', type: DataType.STRING })
  declare legalName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare cnpj: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare phone: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare subdomain: string | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare users: number | null;

  @ForeignKey(() => HostingProvider)
  @AllowNull(true)
  @Column({ field: 'hosting_id', type: DataType.UUID })
  declare hostingId: string | null;

  @AllowNull(true)
  @Column({ field: 'server_ip', type: DataType.STRING })
  declare serverIp: string | null;

  @AllowNull(true)
  @Column({ field: 'billing_base_day', type: DataType.INTEGER })
  declare billingBaseDay: number | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare connections: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare modules: Record<string, unknown> | null;

  @AllowNull(false)
  @Default(PartnerAccountStatus.PENDING_CREATE)
  @Column(DataType.ENUM(...Object.values(PartnerAccountStatus)))
  declare status: PartnerAccountStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare note: string | null;

  @AllowNull(true)
  @Column({ field: 'activated_at', type: DataType.DATE })
  declare activatedAt: Date | null;

  @CreatedAt
  @Column({ field: 'created_at', type: DataType.DATE })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', type: DataType.DATE })
  declare updatedAt: Date;

  @BelongsTo(() => Partner, 'partnerId')
  declare partner?: NonAttribute<Partner>;

  @BelongsTo(() => HostingProvider, 'hostingId')
  declare hosting?: NonAttribute<HostingProvider>;

  @HasMany(() => PartnerChangeRequest, 'accountId')
  declare changeRequests?: NonAttribute<PartnerChangeRequest[]>;
}
