import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

test('resolved per-word explanations are bilingual', () => {
  for (const item of global7Unit1Pronunciation01Content.items.filter(candidate => candidate.type === 'classification')) {
    for (const entry of item.teachingFeedback.answerAnalysis) {
      assert.match(entry.explanation, /\//, `${item.id}/${entry.word}`);
    }
  }
});
