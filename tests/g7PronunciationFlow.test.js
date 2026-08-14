import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

const ids = global7Unit1Pronunciation01Content.items.map(item => item.id);

test('pronunciation item ids stay in the intended contiguous sequence', () => {
  assert.deepEqual(ids, Array.from({ length: 17 }, (_, index) => `g7u1-pr-q${String(index + 1).padStart(2, '0')}`));
});
