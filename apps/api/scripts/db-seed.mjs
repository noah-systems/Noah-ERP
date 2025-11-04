#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const seedScript = join(projectRoot, '..', '..', 'prisma', 'seed.js');

const child = spawn('node', [seedScript], {
  stdio: 'inherit',
  env: process.env,
  cwd: projectRoot,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
