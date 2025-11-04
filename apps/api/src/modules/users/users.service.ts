import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  list() {
    return this.db.user.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    }).then((users) => users.map((user) => user.toJSON()));
  }
}
