import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { extname, join } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const SCAN_DIRS = ['src', 'tests', 'scripts'];
const files = [];

for (const dir of SCAN_DIRS) {
  await collect(join(ROOT, dir));
}

for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || `Syntax check failed: ${file}\n`);
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax check passed: ${files.length} JavaScript modules.`);

async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (extname(entry.name) === '.js' || extname(entry.name) === '.mjs') files.push(path);
  }
}
