import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export enum ImplementationTaskStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE',
  UNSUCCESSFUL = 'UNSUCCESSFUL',
}

export interface ImplementationTaskAttributes {
  id: string;
  accountId: string;
  domain: string;
  status: ImplementationTaskStatus;
  assigneeId: string | null;
  scheduledAt: Date | null;
  notes: string | null;
  position: number;
  createdById: string;
  segment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ImplementationTaskCreationAttributes = Optional<
  ImplementationTaskAttributes,
  'id' | 'status' | 'assigneeId' | 'scheduledAt' | 'notes' | 'position' | 'segment' | 'createdAt' | 'updatedAt'
>;

export class ImplementationTask
  extends Model<ImplementationTaskAttributes, ImplementationTaskCreationAttributes>
  implements ImplementationTaskAttributes
{
  declare id: string;
  declare accountId: string;
  declare domain: string;
  declare status: ImplementationTaskStatus;
  declare assigneeId: string | null;
  declare scheduledAt: Date | null;
  declare notes: string | null;
  declare position: number;
  declare createdById: string;
  declare segment: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initImplementationTaskModel(sequelize: Sequelize): typeof ImplementationTask {
  const existing = sequelize.models.ImplementationTask as typeof ImplementationTask | undefined;
  if (existing) {
    return existing;
  }

  ImplementationTask.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ImplementationTaskStatus)),
        allowNull: false,
        defaultValue: ImplementationTaskStatus.PENDING,
      },
      assigneeId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'ImplementationTask',
      tableName: 'implementation_tasks',
      timestamps: true,
      underscored: true,
    },
  );

  return ImplementationTask;
}

export type ImplementationTaskAttributesUnsafe = ImplementationTaskAttributes;
