import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private db: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException();
    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return {
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
    };
  }

  async me(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.db.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) throw new UnauthorizedException();
      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
