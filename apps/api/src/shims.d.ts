import type {
  DataTypes,
  Model as SequelizeModel,
  ModelAttributes,
  ModelStatic,
  Sequelize as SequelizeCore,
  InitOptions,
} from 'sequelize';
import type { DynamicModule } from '@nestjs/common';

declare module 'sequelize-typescript' {
  export class Model<TModelAttributes = any, TCreationAttributes = any> extends SequelizeModel<
    TModelAttributes,
    TCreationAttributes
  > {}

  export class Sequelize extends SequelizeCore {
    constructor(...args: ConstructorParameters<typeof SequelizeCore>);
    addModels(models: ReadonlyArray<ModelStatic<Model>> | ModelStatic<Model>): void;
  }

  export const DataType: typeof DataTypes;

  export function Table(options?: Partial<InitOptions>): ClassDecorator;
  export function Column(options?: ModelAttributes<Model, any>[string]): PropertyDecorator;
  export function AllowNull(allowNull: boolean): PropertyDecorator;
  export function Default(value: unknown): PropertyDecorator;
  export function PrimaryKey(target: object, propertyKey: string | symbol): void;
  export function Unique(target: object, propertyKey: string | symbol): void;
  export function CreatedAt(target: object, propertyKey: string | symbol): void;
  export function UpdatedAt(target: object, propertyKey: string | symbol): void;
  export function ForeignKey<T>(factory: () => T): PropertyDecorator;
  export function BelongsTo<T>(factory: () => T, foreignKey?: string): PropertyDecorator;
  export function HasMany<T>(factory: () => T, foreignKey?: string): PropertyDecorator;
}

declare module '@nestjs/sequelize' {
  import type { Sequelize } from 'sequelize-typescript';

  export interface SequelizeModuleOptions {
    dialect?: string;
    url?: string;
    autoLoadModels?: boolean;
    synchronize?: boolean;
    logging?: boolean;
    models?: unknown[];
  }

  export class SequelizeModule {
    static forRootAsync(options: {
      useFactory: () => Promise<SequelizeModuleOptions> | SequelizeModuleOptions;
      sequelizeFactory?: () => Promise<Sequelize> | Sequelize;
    }): DynamicModule;
    static forFeature(models: Array<new () => unknown>): DynamicModule;
  }

  export function InjectModel(model: unknown): ParameterDecorator;
  export function InjectConnection(): ParameterDecorator;

  export interface SequelizeOptionsFactory {
    createSequelizeOptions(): Promise<SequelizeModuleOptions> | SequelizeModuleOptions;
  }

  export type SequelizeModuleAsyncOptions = {
    useClass?: new () => SequelizeOptionsFactory;
    useExisting?: new () => SequelizeOptionsFactory;
    useFactory?: () => Promise<SequelizeModuleOptions> | SequelizeModuleOptions;
  };
}
