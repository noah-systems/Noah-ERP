import { Global, Module, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

const SEQUELIZE_TOKEN = Symbol.for('nestjs:sequelize:connection');

export function getConnectionToken() {
  return SEQUELIZE_TOKEN;
}

export function getModelToken(model) {
  return model;
}

export function InjectModel(model) {
  return Inject(getModelToken(model));
}

export function InjectConnection() {
  return Inject(SEQUELIZE_TOKEN);
}

function createSequelizeProvider(options) {
  return {
    provide: SEQUELIZE_TOKEN,
    useFactory: async (...args) => {
      if (typeof options.sequelizeFactory === 'function') {
        return options.sequelizeFactory(...args);
      }
      const resolved = await options.useFactory(...args);
      if (resolved instanceof Sequelize) {
        return resolved;
      }
      const instance = new Sequelize(resolved);
      if (resolved?.models) {
        instance.addModels(resolved.models);
      }
      return instance;
    },
    inject: options.inject ?? [],
  };
}

@Global()
@Module({})
export class SequelizeModule {
  static forRootAsync(options) {
    const sequelizeProvider = createSequelizeProvider(options);
    return {
      module: SequelizeModule,
      providers: [sequelizeProvider],
      exports: [sequelizeProvider],
      global: true,
    };
  }

  static forFeature(models = []) {
    const providers = models.map((model) => ({
      provide: getModelToken(model),
      useValue: model,
    }));

    return {
      module: SequelizeModule,
      providers,
      exports: providers,
    };
  }
}
