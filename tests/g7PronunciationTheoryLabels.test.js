import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/features/drill/theorySupportRenderer.js', import.meta.url), 'utf8');

test('theory controls use bilingual learner labels', () => {
  assert.match(source, /View theory \/ Xem lý thuyết/);
  assert.match(source, /Hide theory \/ Ẩn lý thuyết/);
  assert.match(source, /View theory after submitting \/ Xem lý thuyết sau khi làm câu này/);
});
