import { Module } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { buildSequelizeConfig } from './sequelize.config.js';

export const SEQUELIZE = Symbol('NOAH_SEQUELIZE_INSTANCE');

@Module({
  providers: [
    {
      provide: SEQUELIZE,
      useFactory: () => {
        const { url, options } = buildSequelizeConfig();
        const baseOptions = {
          ...options,
          logging: options.logging ?? false,
          define: {
            underscored: true,
            ...(options.define ?? {}),
          },
        } as const;

        if (url) {
          return new Sequelize(url, baseOptions);
        }

        return new Sequelize({
          ...baseOptions,
          host: options.host,
          port: options.port,
          username: options.username,
          password: options.password,
          database: options.database,
        });
      },
    },
  ],
  exports: [SEQUELIZE],
})
export class NoahSequelizeModule {}
