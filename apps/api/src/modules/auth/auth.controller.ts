import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private s: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.s.login(dto.email, dto.password);
  }

  @Get('me')
  me(@Headers('authorization') authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const token = authHeader.slice('Bearer '.length);
    return this.s.me(token);
  }
}
