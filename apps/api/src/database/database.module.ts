import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { models, sequelize } from './index.js';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: async () => ({
        dialect: 'postgres',
        logging: false,
        autoLoadModels: false,
        synchronize: false,
        models: [...models],
      }),
      sequelizeFactory: async () => sequelize,
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
