import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { ImplementationTask } from './implementation-task.model.js';

export enum ImplementationEventType {
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE',
  UNSUCCESSFUL = 'UNSUCCESSFUL',
  COMMENT = 'COMMENT',
}

export interface ImplementationEventAttributes {
  id: string;
  taskId: string;
  type: ImplementationEventType;
  payload: Record<string, unknown> | null;
  createdById: string;
  createdAt: Date;
}

export type ImplementationEventCreationAttributes = Optional<
  ImplementationEventAttributes,
  'id' | 'payload' | 'createdAt'
>;

export class ImplementationEvent
  extends Model<ImplementationEventAttributes, ImplementationEventCreationAttributes>
  implements ImplementationEventAttributes
{
  declare id: string;
  declare taskId: string;
  declare type: ImplementationEventType;
  declare payload: Record<string, unknown> | null;
  declare createdById: string;
  declare createdAt: Date;
}

export function initImplementationEventModel(sequelize: Sequelize): typeof ImplementationEvent {
  const existing = sequelize.models.ImplementationEvent as typeof ImplementationEvent | undefined;
  if (existing) {
    return existing;
  }

  ImplementationEvent.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      taskId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(ImplementationEventType)),
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true,
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
    },
    {
      sequelize,
      modelName: 'ImplementationEvent',
      tableName: 'implementation_events',
      timestamps: false,
      underscored: true,
    },
  );

  ImplementationEvent.belongsTo(ImplementationTask, {
    as: 'task',
    foreignKey: 'taskId',
    targetKey: 'id',
  });

  return ImplementationEvent;
}

export type ImplementationEventAttributesUnsafe = ImplementationEventAttributes;
