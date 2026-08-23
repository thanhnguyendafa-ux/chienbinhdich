import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const BUNDLES = Object.freeze([
  Object.freeze({
    path: 'media-bundles/g2-u01-u05-images-940a8b63.tar.gz',
    sha256: '940a8b63c2ce6324ced80a8bbb98de05b502d63d6ce9ca0e3406690e7c8dab82',
    entryPrefix: 'media-staging/global-success/g2/',
    expectedFiles: 35
  })
]);

let preparedPromise = null;

function runTar(args) {
  const executable = process.platform === 'win32' ? 'tar.exe' : 'tar';
  const result = spawnSync(executable, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Media bundle tar failed: ${result.stderr || result.stdout || `exit ${result.status}`}`);
  return result.stdout;
}

async function prepare() {
  for (const bundle of BUNDLES) {
    const bytes = await readFile(bundle.path);
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== bundle.sha256) throw new Error(`${bundle.path}: sha256 mismatch.`);

    const entries = runTar(['-tzf', bundle.path]).split(/\r?\n/).filter(Boolean);
    const files = entries.filter(entry => !entry.endsWith('/'));
    if (files.length !== bundle.expectedFiles) throw new Error(`${bundle.path}: expected ${bundle.expectedFiles} files, found ${files.length}.`);
    for (const entry of files) {
      if (!entry.startsWith(bundle.entryPrefix) || entry.includes('..') || !entry.endsWith('.webp')) {
        throw new Error(`${bundle.path}: unsafe or unexpected entry ${entry}`);
      }
    }

    runTar(['-xzf', bundle.path, '-C', '.']);
  }
  return Object.freeze({ bundles: BUNDLES.length, files: BUNDLES.reduce((sum, bundle) => sum + bundle.expectedFiles, 0) });
}

export function prepareMediaBundles() {
  preparedPromise ??= prepare();
  return preparedPromise;
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = await prepareMediaBundles();
  console.log(`Media bundles prepared: ${result.bundles} bundle(s), ${result.files} file(s).`);
}
