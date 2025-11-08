import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Role } from '../auth/roles.enum.js';

export interface UserAttributes {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role' | 'createdAt' | 'updatedAt'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare name: string;
  declare passwordHash: string;
  declare role: Role;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initUserModel(sequelize: Sequelize): typeof User {
  const existing = sequelize.models.User as typeof User | undefined;
  if (existing) {
    return existing;
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(Role)),
        allowNull: false,
        defaultValue: Role.SELLER,
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
    },
  );

  return User;
}
