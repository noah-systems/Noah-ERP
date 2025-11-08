import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';

export type LeadStatus = 'NURTURING' | 'QUALIFIED' | 'DISQUALIFIED';

export interface LeadAttributes {
  id: string;
  companyName: string;
  segment: string | null;
  employeesCount: number | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  status: LeadStatus;
  ownerId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadCreationAttributes = Optional<
  LeadAttributes,
  | 'id'
  | 'segment'
  | 'employeesCount'
  | 'contactName'
  | 'phone'
  | 'email'
  | 'source'
  | 'status'
  | 'ownerId'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>;

export class Lead
  extends Model<LeadAttributes, LeadCreationAttributes>
  implements LeadAttributes
{
  declare id: string;
  declare companyName: string;
  declare segment: string | null;
  declare employeesCount: number | null;
  declare contactName: string | null;
  declare phone: string | null;
  declare email: string | null;
  declare source: string | null;
  declare status: LeadStatus;
  declare ownerId: string | null;
  declare notes: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initLeadModel(sequelize: Sequelize): typeof Lead {
  Lead.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'company_name',
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      employeesCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'employees_count',
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'contact_name',
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('NURTURING', 'QUALIFIED', 'DISQUALIFIED'),
        allowNull: false,
        defaultValue: 'NURTURING',
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'owner_id',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'leads',
      modelName: 'Lead',
      underscored: true,
    }
  );

  return Lead;
}

export function toLeadJSON(model: Lead): LeadAttributes {
  const plain = model.get({ plain: true }) as LeadAttributes;
  return plain;
}

export const LEAD_STATUSES: LeadStatus[] = ['NURTURING', 'QUALIFIED', 'DISQUALIFIED'];
