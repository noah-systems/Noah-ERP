import type { Provider } from '@nestjs/common';
import type { ModelStatic, Sequelize } from 'sequelize';
import { SEQUELIZE } from '../../database/sequelize.module.js';
import { User, initUserModel } from './user.model.js';

export const USER_MODEL = Symbol('USER_MODEL');

export const usersProviders: Provider[] = [
  {
    provide: USER_MODEL,
    useFactory: (sequelize: Sequelize): ModelStatic<User> => initUserModel(sequelize),
    inject: [SEQUELIZE],
  },
];
