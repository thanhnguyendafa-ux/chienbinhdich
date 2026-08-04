import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';

const set = {
  id: 'test',
  version: 2,
  passThreshold: 80,
  items: [
    { id: 'a', stage: 'word', vi: 'a', en: 'alpha' },
    { id: 'b', stage: 'word', vi: 'b', en: 'beta' },
    { id: 'c', stage: 'word', vi: 'c', en: 'gamma' },
    { id: 'd', stage: 'word', vi: 'd', en: 'delta' },
    { id: 'e', stage: 'word', vi: 'e', en: 'echo' }
  ]
};

function meta(startedAt, submittedAt, inputMethod = 'typed', pasteDetected = false) {
  return { startedAt, submittedAt, inputMethod, pasteDetected };
}

test('session keeps attempts as scoring SSOT', () => {
  const session = createSession({ studentName: 'Test', set, now: 1 });
  assert.equal('firstTryCorrect' in session, false);
  assert.equal('itemStates' in session, false);
  assert.deepEqual(session.attempts, []);
});

test('first wrong blocks progress and does not reveal answer', () => {
  const session = createSession({ studentName: 'Test', set, now: 1 });
  const result = submitAnswer({ session, set, answer: 'wrong', attemptMeta: meta(100, 2100), now: 2100 });
  assert.equal(result.event.type, 'incorrect_retry');
  assert.equal(result.event.revealAnswer, null);
  assert.equal(result.session.currentIndex, 0);
  assert.equal(getSessionMetrics(result.session, set).score, 0);
});

test('second wrong reveals answer but still blocks progress', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = submitAnswer({ session, set, answer: 'wrong', attemptMeta: meta(100, 2100) }).session;
  const result = submitAnswer({ session, set, answer: 'still wrong', attemptMeta: meta(2200, 4200) });
  assert.equal(result.event.type, 'incorrect_reveal');
  assert.equal(result.event.revealAnswer, 'alpha');
  assert.equal(result.session.currentIndex, 0);
  assert.equal(result.session.attempts[1].answerRevealedAfterAttempt, true);
});

test('correct after reveal advances but receives no first-try score', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = submitAnswer({ session, set, answer: 'wrong', attemptMeta: meta(100, 2100) }).session;
  session = submitAnswer({ session, set, answer: 'still wrong', attemptMeta: meta(2200, 4200) }).session;
  const result = submitAnswer({ session, set, answer: 'alpha', attemptMeta: meta(4300, 6500, 'paste', true) });
  assert.equal(result.event.type, 'corrected');
  assert.equal(result.session.currentIndex, 1);
  assert.equal(result.event.score, 0);
  const lastAttempt = result.session.attempts.at(-1);
  assert.equal(lastAttempt.attemptNumber, 3);
  assert.equal(lastAttempt.answerRevealedBeforeAttempt, true);
  assert.equal(lastAttempt.pasteDetected, true);
  assert.equal(lastAttempt.inputMethod, 'paste');
  assert.equal(lastAttempt.responseDurationMs, 2200);
});

test('four of five first-try answers passes at 80 percent', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = submitAnswer({ session, set, answer: 'alpha', attemptMeta: meta(10, 20) }).session;
  session = submitAnswer({ session, set, answer: 'beta', attemptMeta: meta(30, 40) }).session;
  session = submitAnswer({ session, set, answer: 'gamma', attemptMeta: meta(50, 60) }).session;
  session = submitAnswer({ session, set, answer: 'wrong', attemptMeta: meta(70, 80) }).session;
  session = submitAnswer({ session, set, answer: 'delta', attemptMeta: meta(90, 100) }).session;
  const result = submitAnswer({ session, set, answer: 'echo', attemptMeta: meta(110, 120) });
  assert.equal(result.event.completed, true);
  assert.equal(result.event.score, 80);
  assert.equal(result.event.passed, true);
});
