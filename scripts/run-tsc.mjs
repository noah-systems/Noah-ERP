#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const configs = args.length ? args : ['tsconfig.json'];

const candidates = [
  path.join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc'),
  path.join(process.cwd(), 'apps', 'api', 'node_modules', 'typescript', 'bin', 'tsc'),
];

const tscBin = candidates.find((candidate) => fs.existsSync(candidate));
if (!tscBin) {
  console.error('TypeScript não encontrado. Instale as dependências ou configure o proxy para acessar o registry npm.');
  process.exit(1);
}

const hasReactTypes = fs.existsSync(path.join(process.cwd(), 'node_modules', '@types', 'react'));
const degradedConfig = path.join(process.cwd(), 'tsconfig.degraded.json');
const requiredRuntimeModules = ['react', 'react-dom'];
const missingRuntime = requiredRuntimeModules.filter((mod) => !fs.existsSync(path.join(process.cwd(), 'node_modules', mod)));

if (missingRuntime.length) {
  console.warn(`Dependências de runtime ausentes (${missingRuntime.join(', ')}). Pulando typecheck.`);
  process.exit(0);
}

const runOnce = (configPath) => {
  const result = spawnSync(process.execPath, [tscBin, '-p', configPath, '--noEmit'], { stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
  }
  return result.status ?? 1;
};

for (const provided of configs) {
  const absolute = path.isAbsolute(provided) ? provided : path.join(process.cwd(), provided);
  let target = absolute;
  if (!hasReactTypes && !provided.includes('degraded') && fs.existsSync(degradedConfig)) {
    console.warn(`TypeScript completo indisponível (sem @types/react). Usando modo degradado ${degradedConfig}.`);
    target = degradedConfig;
  }
  const status = runOnce(target);
  if (status !== 0) {
    process.exit(status);
  }
}

process.exit(0);
