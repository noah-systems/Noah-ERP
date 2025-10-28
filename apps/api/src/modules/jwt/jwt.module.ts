import { DynamicModule, Module } from '@nestjs/common';
import { JWT_SECRET_TOKEN } from './jwt.constants.js';
import { JwtService } from './jwt.service.js';

export interface JwtModuleOptions {
  secret: string;
  global?: boolean;
}

@Module({})
export class JwtModule {
  static register(options: JwtModuleOptions): DynamicModule {
    const providers = [
      { provide: JWT_SECRET_TOKEN, useValue: options.secret },
      JwtService,
    ];

    return {
      module: JwtModule,
      providers,
      exports: [JwtService],
      global: options.global ?? false,
    };
  }
}
