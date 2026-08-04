import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('package exposes one canonical ci command', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.scripts.ci, 'npm run check:syntax && npm run lint:content && npm test');
});

test('GitHub workflow runs canonical CI on pull requests and main', async () => {
  const workflow = await read('.github/workflows/ci.yml');
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /npm run ci/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
});

test('Vercel security headers keep app self-contained', async () => {
  const config = JSON.parse(await read('vercel.json'));
  const headers = Object.fromEntries(config.headers[0].headers.map(({ key, value }) => [key, value]));
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.match(headers['Content-Security-Policy'], /default-src 'self'/);
  assert.match(headers['Content-Security-Policy'], /script-src 'self'/);
});
