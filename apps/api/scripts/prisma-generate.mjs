#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const binDir = join(projectRoot, 'node_modules', '.bin');
const binName = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const prismaBin = existsSync(join(binDir, binName)) ? join(binDir, binName) : binName;

const child = spawn(prismaBin, ['generate'], {
  stdio: 'inherit',
  env: { ...process.env },
  shell: process.platform === 'win32',
  cwd: projectRoot,
});

child.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
  }
});
