import type { DynamicModule } from '@nestjs/common';
import type { Sequelize, SequelizeOptions } from 'sequelize-typescript';

export interface SequelizeModuleOptions extends Partial<SequelizeOptions> {
  models?: readonly any[];
}

export interface SequelizeModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<SequelizeModuleOptions | Sequelize> | SequelizeModuleOptions | Sequelize;
  inject?: any[];
  sequelizeFactory?: (...args: any[]) => Promise<Sequelize> | Sequelize;
}

export declare function getConnectionToken(): symbol;
export declare function getModelToken(model: any): any;
export declare function InjectModel(model: any): ParameterDecorator;
export declare function InjectConnection(): ParameterDecorator;

export declare class SequelizeModule {
  static forRootAsync(options: SequelizeModuleAsyncOptions): DynamicModule;
  static forFeature(models?: readonly any[]): DynamicModule;
}
