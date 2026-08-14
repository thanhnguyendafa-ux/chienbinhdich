import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

test('theory support stores only access policy and reuses teachingFeedback knowledge', () => {
  for (const item of global7Unit1Pronunciation01Content.items) {
    assert.deepEqual(Object.keys(item.theorySupport), ['access']);
    assert.ok(item.teachingFeedback?.theory);
    assert.ok(item.teachingFeedback?.example);
  }
});
