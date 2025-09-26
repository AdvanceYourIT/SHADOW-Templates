#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const HELP_MESSAGE = `
Usage: node scripts/apply-package.mjs <package-id> [options]

This lightweight helper demonstrates where automation for downloading and applying
packages will live. Future revisions will:
  - Fetch package metadata from manifests/index.json or a remote URL.
  - Download referenced assets and verify their checksums.
  - Prepare the package contents for import into NinjaOne.
`;

async function main() {
  const [, , command] = process.argv;

  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(HELP_MESSAGE);
    return;
  }

  const packageId = command;
  const manifestPath = resolve('manifests', 'index.json');
  const manifestRaw = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  const entry = manifest.packages.find((pkg) => pkg.id === packageId);

  if (!entry) {
    console.error(`Package "${packageId}" not found in manifest.`);
    process.exitCode = 1;
    return;
  }

  const outputPath = resolve('dist', `${packageId.replace(/\//g, '_')}.json`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(entry, null, 2));
  console.log(`Wrote package metadata to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
