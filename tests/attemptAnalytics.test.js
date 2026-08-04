import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveAttemptAnalytics } from '../src/core/attemptAnalytics.js';

const set = {
  items: [
    { id: 'short', en: 'like' },
    { id: 'long', en: 'help me relax' }
  ]
};

const session = {
  attempts: [
    { id: 'a1', itemId: 'short', responseDurationMs: 500, pasteDetected: false, answerRevealedBeforeAttempt: false },
    { id: 'a2', itemId: 'long', responseDurationMs: 700, pasteDetected: false, answerRevealedBeforeAttempt: false },
    { id: 'a3', itemId: 'long', responseDurationMs: 2500, pasteDetected: true, answerRevealedBeforeAttempt: true }
  ]
};

test('analytics flags paste and meaningful rapid replies without calling short words rapid', () => {
  const analytics = deriveAttemptAnalytics(session, set);
  assert.equal(analytics.pasteCount, 1);
  assert.equal(analytics.rapidCount, 1);
  assert.deepEqual(analytics.attempts[0].flags, []);
  assert.deepEqual(analytics.attempts[1].flags, ['rapid']);
  assert.deepEqual(analytics.attempts[2].flags, ['paste', 'answer_seen']);
});
