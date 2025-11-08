import { Inject, Injectable } from '@nestjs/common';
import type { ModelStatic } from 'sequelize';
import { User } from './user.model.js';
import { USER_MODEL } from './users.providers.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_MODEL)
    private readonly userModel: ModelStatic<User>,
  ) {}

  list() {
    return this.userModel
      .findAll({
        attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        order: [['name', 'ASC']],
      })
      .then((users) => users.map((user) => user.toJSON()));
  }
}
