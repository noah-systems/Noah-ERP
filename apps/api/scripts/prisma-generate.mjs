#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, delimiter } from 'node:path';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const binDir = join(projectRoot, 'node_modules', '.bin');
const binName = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const prismaBin = existsSync(join(binDir, binName)) ? join(binDir, binName) : binName;

const schemaPath = join(projectRoot, '..', '..', 'prisma', 'schema.prisma');

const child = spawn(prismaBin, ['generate', '--schema', schemaPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true',
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1',
    PRISMA_GENERATE_NO_ENGINE: 'true',
    NODE_PATH: [
      join(projectRoot, 'node_modules'),
      process.env.NODE_PATH,
    ]
      .filter(Boolean)
      .join(delimiter),
  },
  shell: process.platform === 'win32',
  cwd: projectRoot,
});

child.on('exit', (code) => {
  if (code !== 0) {
    process.exit(code ?? 1);
  }
});
