import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, submitAnswer, getSessionMetrics } from '../src/core/sessionMachine.js';

const lesson = ({ id = 'demo-explain', items = [
  { id: 'q1', type: 'typing', stage: 'word', vi: 'đọc', en: 'reading' },
  { id: 'q2', type: 'typing', stage: 'sentence', vi: 'Mai thích đọc sách.', en: 'Mai likes reading books.' }
] } = {}) => ({
  id,
  version: 1,
  passThreshold: 80,
  completionPolicy: 'explain-and-accept',
  typingTolerance: true,
  items
});

test('explain-and-accept reveals after the first wrong answer and advances without retry', () => {
  const set = lesson();
  const session = createSession({ studentName: 'Ben', set, now: 1000 });
  const result = submitAnswer({ session, set, response: 'read', now: 2000 });

  assert.equal(result.event.type, 'explained_incorrect');
  assert.equal(result.event.answer, 'reading');
  assert.equal(result.session.currentItemId, 'q2');
  assert.equal(result.session.currentPromptKind, 'main');
  assert.deepEqual(result.session.retryQueue, []);
  assert.equal(result.session.attempts[0].answerRevealedAfterAttempt, true);
  assert.equal(getSessionMetrics(result.session, set).completedMainItems, 1);
});

test('explain-and-accept completes after every main item has been submitted even with wrong answers', () => {
  const set = lesson();
  let session = createSession({ studentName: 'Mai', set, now: 1000 });
  session = submitAnswer({ session, set, response: 'read', now: 2000 }).session;
  const result = submitAnswer({ session, set, response: 'wrong sentence', now: 3000 });

  assert.equal(result.event.type, 'explained_incorrect');
  assert.equal(result.session.status, 'passed');
  const metrics = getSessionMetrics(result.session, set, 3000);
  assert.equal(metrics.completedMainItems, 2);
  assert.equal(metrics.mainComplete, true);
  assert.equal(metrics.passed, true);
});

test('existing all-items lessons keep the original retry behavior', () => {
  const set = {
    ...lesson({ id: 'legacy', items: [{ id: 'q1', type: 'typing', vi: 'đọc', en: 'reading' }] }),
    completionPolicy: 'all-items'
  };
  const session = createSession({ studentName: 'Legacy', set, now: 1000 });
  const result = submitAnswer({ session, set, response: 'read', now: 2000 });

  assert.equal(result.event.type, 'incorrect_retry');
  assert.equal(result.event.revealAnswer, null);
  assert.equal(result.session.currentItemId, 'q1');
  assert.equal(result.session.retryQueue.length, 1);
});
