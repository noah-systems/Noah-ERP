import type {
  DataTypes,
  Model as SequelizeModel,
  ModelAttributes,
  ModelStatic,
  Sequelize as SequelizeCore,
  InitOptions,
} from 'sequelize';

export declare class Model<TModelAttributes = any, TCreationAttributes = any> extends SequelizeModel<
  TModelAttributes,
  TCreationAttributes
> {}

export declare class Sequelize extends SequelizeCore {
  constructor(...args: ConstructorParameters<typeof SequelizeCore>);
  addModels(models: ReadonlyArray<ModelStatic<Model>> | ModelStatic<Model>): void;
}

export declare const DataType: typeof DataTypes;

export declare function Table(options?: Partial<InitOptions>): ClassDecorator;
export declare function Column(options?: ModelAttributes<Model, any>[string]): PropertyDecorator;
export declare function AllowNull(allowNull: boolean): PropertyDecorator;
export declare function Default(value: unknown): PropertyDecorator;
export declare function PrimaryKey(target: object, propertyKey: string | symbol): void;
export declare function Unique(target: object, propertyKey: string | symbol): void;
export declare function CreatedAt(target: object, propertyKey: string | symbol): void;
export declare function UpdatedAt(target: object, propertyKey: string | symbol): void;
export declare function ForeignKey<T>(factory: () => T): PropertyDecorator;
export declare function BelongsTo<T>(factory: () => T, foreignKey?: string): PropertyDecorator;
export declare function HasMany<T>(factory: () => T, foreignKey?: string): PropertyDecorator;
