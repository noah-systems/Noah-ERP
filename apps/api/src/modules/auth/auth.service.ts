import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { JwtService } from '../jwt/jwt.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private db: DatabaseService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.db.user.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(password, user.get('passwordHash') as string);
    if (!ok) throw new UnauthorizedException();
    const token = await this.jwt.signAsync({ sub: user.get('id'), role: user.get('role') });
    return {
      token,
      user: {
        id: user.get('id'),
        name: user.get('name'),
        role: user.get('role'),
        email: user.get('email'),
      },
    };
  }

  async me(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.db.user.findByPk(payload.sub, {
        attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      if (!user) throw new UnauthorizedException();
      return user.toJSON();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
