import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const artifacts = [
  {
    base64Path: path.join(projectRoot, 'vendor', 'axios-1.7.9.tgz.base64'),
    outputPath: path.join(projectRoot, 'vendor', 'axios-1.7.9.tgz'),
    sha512: 'g5zFVvKvBVizdMDwyS06fwyDKMHFDHYM1OqpupcotvLQwFga6ygnev1dp+Zx8yUS5DXBXGF2JJdnEGqNOMssMQ=='
  }
];

function normalizeBase64(data) {
  return data.replace(/\s+/g, '');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function computeSha512(buffer) {
  return createHash('sha512').update(buffer).digest('base64');
}

async function ensureArtifact({ base64Path, outputPath, sha512 }) {
  const base64Raw = await fs.readFile(base64Path, 'utf8');
  const base64Data = normalizeBase64(base64Raw);
  const buffer = Buffer.from(base64Data, 'base64');

  if (sha512) {
    const hash = await computeSha512(buffer);
    if (hash !== sha512) {
      throw new Error(`Checksum mismatch for ${path.basename(outputPath)} (expected ${sha512}, got ${hash})`);
    }
  }

  if (await fileExists(outputPath)) {
    const existing = await fs.readFile(outputPath);
    const currentHash = await computeSha512(existing);
    if (currentHash === sha512) {
      return;
    }
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
}

async function main() {
  for (const artifact of artifacts) {
    await ensureArtifact(artifact);
  }
}

main().catch((error) => {
  console.error('[materialize-vendor] Failed to restore vendored artifacts:', error);
  process.exitCode = 1;
});
