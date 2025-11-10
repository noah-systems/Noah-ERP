import { Model as SequelizeModel, Sequelize as SequelizeCore, DataTypes } from 'sequelize';

const META_KEY = Symbol.for('sequelize-typescript:meta');

function getMeta(model) {
  if (!Object.prototype.hasOwnProperty.call(model, META_KEY)) {
    Object.defineProperty(model, META_KEY, {
      value: {
        table: {},
        columns: new Map(),
        associations: [],
        lifecycle: {},
      },
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }
  return model[META_KEY];
}

function mergeColumnOption(model, propertyKey, option) {
  const meta = getMeta(model);
  const existing = meta.columns.get(propertyKey) ?? {};
  meta.columns.set(propertyKey, { ...existing, ...option });
}

function normalizeColumnArg(arg) {
  if (!arg) {
    return {};
  }
  if (typeof arg === 'object' && 'type' in arg) {
    return { ...arg };
  }
  return { type: arg };
}

export class Model extends SequelizeModel {}

export class Sequelize extends SequelizeCore {
  addModels(models) {
    const list = Array.isArray(models) ? models : [models];
    for (const model of list) {
      initializeModel(this, model);
    }
    for (const model of list) {
      initializeAssociations(model);
    }
  }
}

function initializeModel(sequelize, model) {
  const meta = getMeta(model);
  const attributes = {};
  for (const [key, definition] of meta.columns.entries()) {
    attributes[key] = { ...definition };
  }
  const table = meta.table ?? {};
  const options = {
    sequelize,
    tableName: table.tableName,
    modelName: table.modelName ?? model.name,
    timestamps: table.timestamps ?? true,
    underscored: table.underscored ?? false,
    paranoid: table.paranoid ?? false,
    indexes: table.indexes,
    createdAt: meta.lifecycle.createdAt,
    updatedAt: meta.lifecycle.updatedAt,
  };
  model.init(attributes, options);
}

function initializeAssociations(model) {
  const meta = getMeta(model);
  for (const association of meta.associations) {
    const target = association.target();
    const options = { ...association.options };
    if (!options.as) {
      options.as = association.propertyKey;
    }
    switch (association.type) {
      case 'belongsTo':
        model.belongsTo(target, options);
        break;
      case 'hasMany':
        model.hasMany(target, options);
        break;
      default:
        break;
    }
  }
}

export const DataType = new Proxy(
  {},
  {
    get(_target, prop, receiver) {
      const value = Reflect.get(DataTypes, prop, receiver);
      if (typeof value === 'function') {
        return (...args) => value.apply(DataTypes, args);
      }
      return value;
    },
  },
);

export function Table(options = {}) {
  return function decorator(target) {
    const meta = getMeta(target);
    meta.table = { ...meta.table, ...options };
  };
}

export function Column(arg) {
  return function decorator(target, propertyKey) {
    mergeColumnOption(target.constructor, propertyKey, normalizeColumnArg(arg));
  };
}

export function AllowNull(allowNull) {
  return function decorator(target, propertyKey) {
    mergeColumnOption(target.constructor, propertyKey, { allowNull });
  };
}

export function Default(value) {
  return function decorator(target, propertyKey) {
    mergeColumnOption(target.constructor, propertyKey, { defaultValue: value });
  };
}

export function PrimaryKey(target, propertyKey) {
  mergeColumnOption(target.constructor, propertyKey, { primaryKey: true });
}

export function Unique(target, propertyKey) {
  mergeColumnOption(target.constructor, propertyKey, { unique: true });
}

export function CreatedAt(target, propertyKey) {
  const meta = getMeta(target.constructor);
  meta.lifecycle.createdAt = propertyKey;
}

export function UpdatedAt(target, propertyKey) {
  const meta = getMeta(target.constructor);
  meta.lifecycle.updatedAt = propertyKey;
}

export function ForeignKey(_factory) {
  return function decorator(target, propertyKey) {
    // Foreign key metadata is optional for this lightweight implementation.
    mergeColumnOption(target.constructor, propertyKey, {});
  };
}

function associationDecorator(type, factory, options) {
  return function decorator(target, propertyKey) {
    const meta = getMeta(target.constructor);
    meta.associations.push({
      type,
      propertyKey,
      target: factory,
      options: options ?? {},
    });
  };
}

export function BelongsTo(factory, foreignKey) {
  const options = foreignKey ? { foreignKey } : undefined;
  return associationDecorator('belongsTo', factory, options);
}

export function HasMany(factory, foreignKey) {
  const options = foreignKey ? { foreignKey } : undefined;
  return associationDecorator('hasMany', factory, options);
}
