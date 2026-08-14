import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

test('theory access switches exactly at the first classification', () => {
  const access = global7Unit1Pronunciation01Content.items.map(item => item.theorySupport?.access);
  assert.deepEqual(access, [
    'anytime','anytime','anytime','anytime','anytime','anytime','anytime','anytime','anytime','anytime','anytime',
    'after_submit','after_submit','after_submit','after_submit','after_submit','after_submit'
  ]);
});
