import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

for (const item of global7Unit1Pronunciation01Content.items.filter(candidate => candidate.type === 'classification')) {
  test(`${item.id} pre-answer theory stays general`, () => {
    const theory = `${item.teachingFeedback.theory} ${item.teachingFeedback.example}`.toLowerCase();
    const analysis = item.teachingFeedback.answerAnalysis ?? [];
    assert.ok(theory.includes('weak') || theory.includes('unstressed'));
    assert.ok(theory.includes('ir') || theory.includes('ur') || theory.includes('ear') || theory.includes('wor'));
    assert.equal(Array.isArray(analysis), true);
    assert.equal(item.theorySupport.access, 'after_submit');
  });
}
