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

test('analytics accepts MCQ, true-false and sentence-order items without typing-only fields', () => {
  const mixedSet = {
    items: [
      { id: 'q1', type: 'mcq', prompt: 'Pick one', choices: [{ id: 'a', text: 'A' }], correctChoiceId: 'a' },
      { id: 'q2', type: 'true_false', statement: 'True?', answer: true },
      { id: 'q3', type: 'sentence_order', prompt: 'Order', correctOrder: ['I', 'learn.'] }
    ]
  };
  const mixedSession = {
    attempts: [
      { id: 'm1', itemId: 'q1', responseDurationMs: 120, pasteDetected: false, answerRevealedBeforeAttempt: false },
      { id: 'm2', itemId: 'q2', responseDurationMs: 130, pasteDetected: false, answerRevealedBeforeAttempt: false },
      { id: 'm3', itemId: 'q3', responseDurationMs: 140, pasteDetected: false, answerRevealedBeforeAttempt: false }
    ]
  };

  const analytics = deriveAttemptAnalytics(mixedSession, mixedSet);
  assert.equal(analytics.rapidCount, 0);
  assert.equal(analytics.attempts.length, 3);
  assert.deepEqual(analytics.attempts.map(attempt => attempt.flags), [[], [], []]);
});
