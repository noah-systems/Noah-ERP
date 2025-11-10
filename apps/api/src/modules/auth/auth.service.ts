import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '../jwt/jwt.service.js';
import bcrypt from 'bcryptjs';
import { User } from '../../database/models/user.model.js';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User) private readonly users: typeof User, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException();
    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    };
  }

  async me(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.users.findByPk(payload.sub, {
        attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      });
      if (!user) throw new UnauthorizedException();
      return user.toJSON();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
