import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

test('each pronunciation classification screen contains at most five words', () => {
  for (const item of global7Unit1Pronunciation01Content.items.filter(candidate => candidate.type === 'classification')) {
    assert.ok(item.tokens.length <= 5, item.id);
    assert.ok(item.tokens.length >= 4, item.id);
  }
});
