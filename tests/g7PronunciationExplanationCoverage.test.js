import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

test('each classified word has a non-empty target sound and explanation', () => {
  const entries = global7Unit1Pronunciation01Content.items
    .filter(item => item.type === 'classification')
    .flatMap(item => item.teachingFeedback.answerAnalysis);
  assert.equal(entries.length, 26);
  for (const entry of entries) {
    assert.ok(entry.word);
    assert.ok(entry.sound);
    assert.ok(entry.explanation);
  }
});
