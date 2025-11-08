import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DataTypes,
  Model,
  ModelStatic,
  QueryTypes,
  Sequelize,
  Transaction,
} from 'sequelize';
import { Channel, ItemKind, PartnerAccountStatus, Role } from './enums.js';

const TRUTHY_STRINGS = new Set(['1', 'true', 'yes', 'y', 'on']);
const FALSY_STRINGS = new Set(['0', 'false', 'no', 'n', 'off']);

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (TRUTHY_STRINGS.has(normalized)) {
    return true;
  }

  if (FALSY_STRINGS.has(normalized)) {
    return false;
  }

  return undefined;
}

function shouldAllowMissingDatabase(): boolean {
  const override =
    parseBoolean(process.env.NOAH_ALLOW_MISSING_DATABASE) ??
    parseBoolean(process.env.ALLOW_MISSING_DATABASE);

  if (override !== undefined) {
    return override;
  }

  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  return nodeEnv !== 'production';
}

type ModelDictionary = {
  user: ModelStatic<Model>;
  leadStatus: ModelStatic<Model>;
  lead: ModelStatic<Model>;
  opportunityStage: ModelStatic<Model>;
  hostingProvider: ModelStatic<Model>;
  opportunity: ModelStatic<Model>;
  oppHistory: ModelStatic<Model>;
  canceledSale: ModelStatic<Model>;
  partner: ModelStatic<Model>;
  partnerAccount: ModelStatic<Model>;
  partnerChangeRequest: ModelStatic<Model>;
  priceItem: ModelStatic<Model>;
  priceTier: ModelStatic<Model>;
  discountPolicy: ModelStatic<Model>;
};

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly sequelize: Sequelize;
  private readonly models: ModelDictionary;
  private readonly allowMissingDatabase: boolean;
  private shutdownHooksRegistered = false;

  constructor() {
    this.allowMissingDatabase = shouldAllowMissingDatabase();
    const url = process.env.DATABASE_URL;
    if (!url && !this.allowMissingDatabase) {
      throw new Error('DATABASE_URL environment variable is required for the API to start.');
    }

    this.sequelize = url
      ? new Sequelize(url, {
          dialect: 'postgres',
          logging: false,
        })
      : new Sequelize('postgres://postgres@localhost:5432/postgres', {
          dialect: 'postgres',
          logging: false,
        });

    this.models = this.defineModels();
    this.setupAssociations();
  }

  get user() {
    return this.models.user;
  }

  get leadStatus() {
    return this.models.leadStatus;
  }

  get lead() {
    return this.models.lead;
  }

  get opportunityStage() {
    return this.models.opportunityStage;
  }

  get hostingProvider() {
    return this.models.hostingProvider;
  }

  get opportunity() {
    return this.models.opportunity;
  }

  get oppHistory() {
    return this.models.oppHistory;
  }

  get partner() {
    return this.models.partner;
  }

  get partnerAccount() {
    return this.models.partnerAccount;
  }

  get partnerChangeRequest() {
    return this.models.partnerChangeRequest;
  }

  get priceItem() {
    return this.models.priceItem;
  }

  get priceTier() {
    return this.models.priceTier;
  }

  get discountPolicy() {
    return this.models.discountPolicy;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      this.logger.log('Connected to the database.');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to the database on startup.');
      this.logger.error(`Check DATABASE_URL and database credentials: ${reason}`);

      if (this.allowMissingDatabase) {
        this.logger.warn(
          'Continuing without an active database connection. Queries will fail until the database is reachable.',
        );
        return;
      }

      throw error instanceof Error ? error : new Error(reason);
    }
  }

  enableShutdownHooks(app: INestApplication): void {
    if (this.shutdownHooksRegistered) {
      return;
    }

    this.shutdownHooksRegistered = true;

    process.on('beforeExit', () => {
      app.close().catch((error) => {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to close the application on shutdown: ${reason}`);
      });
    });
  }

  async queryRaw(query: string, replacements?: unknown[]): Promise<unknown> {
    return this.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });
  }

  async transaction<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
    return this.sequelize.transaction(async (transaction) => fn(transaction));
  }

  private defineModels(): ModelDictionary {
    const user = this.sequelize.define(
      'User',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.ENUM(...Object.values(Role)), allowNull: false, defaultValue: Role.SELLER },
        partnerId: { type: DataTypes.STRING, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'User', freezeTableName: true, timestamps: true },
    );

    const leadStatus = this.sequelize.define(
      'LeadStatus',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        color: { type: DataTypes.STRING, allowNull: false },
        tmkReasonRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'LeadStatus', freezeTableName: true, timestamps: true },
    );

    const lead = this.sequelize.define(
      'Lead',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        company: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        segment: { type: DataTypes.STRING, allowNull: true },
        headcount: { type: DataTypes.INTEGER, allowNull: true },
        contact: { type: DataTypes.STRING, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        source: { type: DataTypes.STRING, allowNull: false, defaultValue: 'MANUAL' },
        statusId: { type: DataTypes.STRING, allowNull: false },
        ownerId: { type: DataTypes.STRING, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'Lead', freezeTableName: true, timestamps: true },
    );

    const opportunityStage = this.sequelize.define(
      'OpportunityStage',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        lostReasonRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      },
      { tableName: 'OpportunityStage', freezeTableName: true, timestamps: false },
    );

    const hostingProvider = this.sequelize.define(
      'HostingProvider',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        name: { type: DataTypes.STRING, allowNull: false },
      },
      { tableName: 'HostingProvider', freezeTableName: true, timestamps: false },
    );

    const opportunity = this.sequelize.define(
      'Opportunity',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        ownerId: { type: DataTypes.STRING, allowNull: false },
        leadId: { type: DataTypes.STRING, allowNull: true },
        stageId: { type: DataTypes.STRING, allowNull: false },
        hostingId: { type: DataTypes.STRING, allowNull: true },
        legalName: { type: DataTypes.STRING, allowNull: true },
        cnpj: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.STRING, allowNull: true },
        subdomain: { type: DataTypes.STRING, allowNull: true },
        users: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        whatsapp: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        instagram: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        facebook: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        waba: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        serverIp: { type: DataTypes.STRING, allowNull: true },
        trialStart: { type: DataTypes.DATE, allowNull: true },
        activation: { type: DataTypes.DATE, allowNull: true },
        billingBaseDay: { type: DataTypes.INTEGER, allowNull: true },
        priceTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        priceMonthly: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'Opportunity', freezeTableName: true, timestamps: true },
    );

    const oppHistory = this.sequelize.define(
      'OppHistory',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        oppId: { type: DataTypes.STRING, allowNull: false },
        actorId: { type: DataTypes.STRING, allowNull: false },
        fromStageId: { type: DataTypes.STRING, allowNull: true },
        toStageId: { type: DataTypes.STRING, allowNull: true },
        note: { type: DataTypes.TEXT, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'OppHistory', freezeTableName: true, timestamps: false },
    );

    const canceledSale = this.sequelize.define(
      'CanceledSale',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        oppId: { type: DataTypes.STRING, allowNull: false, unique: true },
        reason: { type: DataTypes.TEXT, allowNull: true },
        summary: { type: DataTypes.TEXT, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'CanceledSale', freezeTableName: true, timestamps: false },
    );

    const partner = this.sequelize.define(
      'Partner',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        nickname: { type: DataTypes.STRING, allowNull: false },
        legalName: { type: DataTypes.STRING, allowNull: false },
        cnpj: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: true },
        domain: { type: DataTypes.STRING, allowNull: true },
        contact: { type: DataTypes.STRING, allowNull: true },
        whatsapp: { type: DataTypes.STRING, allowNull: true },
        financeEmail: { type: DataTypes.STRING, allowNull: true },
        priceTable: { type: DataTypes.JSONB, allowNull: true },
      },
      { tableName: 'Partner', freezeTableName: true, timestamps: false },
    );

    const partnerAccount = this.sequelize.define(
      'PartnerAccount',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        partnerId: { type: DataTypes.STRING, allowNull: false },
        legalName: { type: DataTypes.STRING, allowNull: false },
        cnpj: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: true },
        subdomain: { type: DataTypes.STRING, allowNull: true },
        users: { type: DataTypes.INTEGER, allowNull: true },
        hostingId: { type: DataTypes.STRING, allowNull: true },
        serverIp: { type: DataTypes.STRING, allowNull: true },
        billingBaseDay: { type: DataTypes.INTEGER, allowNull: true },
        connections: { type: DataTypes.JSONB, allowNull: true },
        modules: { type: DataTypes.JSONB, allowNull: true },
        status: {
          type: DataTypes.ENUM(...Object.values(PartnerAccountStatus)),
          allowNull: false,
          defaultValue: PartnerAccountStatus.PENDING_CREATE,
        },
        note: { type: DataTypes.TEXT, allowNull: true },
        activatedAt: { type: DataTypes.DATE, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'PartnerAccount', freezeTableName: true, timestamps: true },
    );

    const partnerChangeRequest = this.sequelize.define(
      'PartnerChangeRequest',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        accountId: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
        payload: { type: DataTypes.JSONB, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      { tableName: 'PartnerChangeRequest', freezeTableName: true, timestamps: false },
    );

    const priceItem = this.sequelize.define(
      'PriceItem',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        sku: { type: DataTypes.STRING, allowNull: false, unique: true },
        name: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        channel: { type: DataTypes.ENUM(...Object.values(Channel)), allowNull: false },
        kind: { type: DataTypes.ENUM(...Object.values(ItemKind)), allowNull: false },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { tableName: 'PriceItem', freezeTableName: true, timestamps: false },
    );

    const priceTier = this.sequelize.define(
      'PriceTier',
      {
        id: { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        channel: { type: DataTypes.ENUM(...Object.values(Channel)), allowNull: false },
        minUsers: { type: DataTypes.INTEGER, allowNull: false },
        maxUsers: { type: DataTypes.INTEGER, allowNull: true },
        pricePerUser: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      },
      { tableName: 'PriceTier', freezeTableName: true, timestamps: false },
    );

    const discountPolicy = this.sequelize.define(
      'DiscountPolicy',
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        role: { type: DataTypes.ENUM(...Object.values(Role)), allowNull: false, unique: true },
        maxPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      },
      { tableName: 'DiscountPolicy', freezeTableName: true, timestamps: false },
    );

    return {
      user,
      leadStatus,
      lead,
      opportunityStage,
      hostingProvider,
      opportunity,
      oppHistory,
      canceledSale,
      partner,
      partnerAccount,
      partnerChangeRequest,
      priceItem,
      priceTier,
      discountPolicy,
    };
  }

  private setupAssociations(): void {
    const {
      user,
      leadStatus,
      lead,
      opportunityStage,
      hostingProvider,
      opportunity,
      oppHistory,
      partner,
      partnerAccount,
      partnerChangeRequest,
    } = this.models;

    user.hasMany(lead, { as: 'leads', foreignKey: 'ownerId' });
    lead.belongsTo(user, { as: 'owner', foreignKey: 'ownerId' });

    leadStatus.hasMany(lead, { as: 'leads', foreignKey: 'statusId' });
    lead.belongsTo(leadStatus, { as: 'status', foreignKey: 'statusId' });

    user.hasMany(opportunity, { as: 'opportunities', foreignKey: 'ownerId' });
    opportunity.belongsTo(user, { as: 'owner', foreignKey: 'ownerId' });

    lead.hasMany(opportunity, { as: 'opportunities', foreignKey: 'leadId' });
    opportunity.belongsTo(lead, { as: 'lead', foreignKey: 'leadId' });

    opportunityStage.hasMany(opportunity, { as: 'opportunities', foreignKey: 'stageId' });
    opportunity.belongsTo(opportunityStage, { as: 'stage', foreignKey: 'stageId' });

    hostingProvider.hasMany(opportunity, { as: 'opportunities', foreignKey: 'hostingId' });
    opportunity.belongsTo(hostingProvider, { as: 'hosting', foreignKey: 'hostingId' });

    opportunity.hasMany(oppHistory, { as: 'history', foreignKey: 'oppId' });
    oppHistory.belongsTo(opportunity, { as: 'opp', foreignKey: 'oppId' });

    user.hasMany(oppHistory, { as: 'histories', foreignKey: 'actorId' });
    oppHistory.belongsTo(user, { as: 'actor', foreignKey: 'actorId' });

    opportunityStage.hasMany(oppHistory, { as: 'historyFrom', foreignKey: 'fromStageId' });
    oppHistory.belongsTo(opportunityStage, { as: 'fromStage', foreignKey: 'fromStageId' });

    opportunityStage.hasMany(oppHistory, { as: 'historyTo', foreignKey: 'toStageId' });
    oppHistory.belongsTo(opportunityStage, { as: 'toStage', foreignKey: 'toStageId' });

    partner.hasMany(partnerAccount, { as: 'accounts', foreignKey: 'partnerId' });
    partnerAccount.belongsTo(partner, { as: 'partner', foreignKey: 'partnerId' });

    hostingProvider.hasMany(partnerAccount, { as: 'accounts', foreignKey: 'hostingId' });
    partnerAccount.belongsTo(hostingProvider, { as: 'hosting', foreignKey: 'hostingId' });

    partnerAccount.hasMany(partnerChangeRequest, { as: 'changeRequests', foreignKey: 'accountId' });
    partnerChangeRequest.belongsTo(partnerAccount, { as: 'account', foreignKey: 'accountId' });
  }
}
