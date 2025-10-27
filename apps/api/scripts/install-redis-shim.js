#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const shimRoot = path.join(ROOT, 'node_modules', '@liaoliaots', 'nestjs-redis');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(shimRoot);

const pkgPath = path.join(shimRoot, 'package.json');
let shouldWrite = true;
if (fs.existsSync(pkgPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (existing && typeof existing.version === 'string' && !existing.version.includes('noah-shim')) {
      shouldWrite = false;
    }
  } catch (err) {
    shouldWrite = true;
  }
}

if (shouldWrite) {
  const shimPackage = {
    name: '@liaoliaots/nestjs-redis',
    version: '0.0.0-noah-shim',
    description: 'Runtime shim gerado automaticamente para Docker',
    main: 'index.js',
    typings: 'index.d.ts',
  };
  fs.writeFileSync(pkgPath, JSON.stringify(shimPackage, null, 2));
}

const indexJsPath = path.join(shimRoot, 'index.js');
const indexJs = `'use strict';

const { Global, Inject, Module } = require('@nestjs/common');
const Redis = require('ioredis');

const DEFAULT_HOST = 'redis';
const DEFAULT_PORT = '6379';
const REDIS_TOKEN = 'REDIS_CLIENT';

function resolveRedisUrl() {
  const explicit = (process.env.REDIS_URL || '').trim();
  if (explicit) {
    return explicit;
  }

  const host = (process.env.REDIS_HOST || DEFAULT_HOST).trim() || DEFAULT_HOST;
  const port = (process.env.REDIS_PORT || DEFAULT_PORT).trim() || DEFAULT_PORT;
  return `redis://${host}:${port}`;
}

const providers = [
  {
    provide: REDIS_TOKEN,
    useFactory: () => {
      const url = resolveRedisUrl();
      return new Redis(url);
    },
  },
];

let RedisModule = class RedisModule {};
RedisModule = Module({
  providers,
  exports: [REDIS_TOKEN],
})(RedisModule);
RedisModule = Global()(RedisModule);

RedisModule.forRoot = () => ({
  module: RedisModule,
  providers,
  exports: [REDIS_TOKEN],
});

const InjectRedis = () => Inject(REDIS_TOKEN);

module.exports = {
  REDIS_TOKEN,
  RedisModule,
  InjectRedis,
};
`;
fs.writeFileSync(indexJsPath, indexJs);

const indexDtsPath = path.join(shimRoot, 'index.d.ts');
const indexDts = `import type { DynamicModule, Provider } from '@nestjs/common';
import type Redis from 'ioredis';
export declare const REDIS_TOKEN = 'REDIS_CLIENT';
export declare const InjectRedis: () => ParameterDecorator;
export declare class RedisModule {
  static forRoot(): DynamicModule;
}
export type RedisClient = Redis;
export type RedisProvider = Provider<Redis>;
`;
fs.writeFileSync(indexDtsPath, indexDts);
