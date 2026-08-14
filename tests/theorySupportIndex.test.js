import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('app shell loads the reusable theory support stylesheet', () => {
  assert.match(indexSource, /\/styles\/theory-support\.css/);
});
