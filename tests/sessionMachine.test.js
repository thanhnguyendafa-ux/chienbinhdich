import test from 'node:test';
import assert from 'node:assert/strict';
import { abandonSession, createSession, getCurrentItem, getSessionMetrics, submitAnswer, submitPassedSession } from '../src/core/sessionMachine.js';

const set = {
  id: 'test',
  version: 3,
  passThreshold: 80,
  items: [
    { id: 'a', stage: 'word', vi: 'a', en: 'alpha' },
    { id: 'b', stage: 'word', vi: 'b', en: 'beta' },
    { id: 'c', stage: 'word', vi: 'c', en: 'gamma' },
    { id: 'd', stage: 'phrase', vi: 'd', en: 'delta' },
    { id: 'e', stage: 'sentence', vi: 'e', en: 'echo' }
  ]
};

function meta(startedAt, submittedAt, inputMethod = 'typed', pasteDetected = false) {
  return { startedAt, submittedAt, inputMethod, pasteDetected };
}

function answer(session, value, t) {
  return submitAnswer({ session, set, answer: value, attemptMeta: meta(t, t + 10), now: t + 10 });
}

test('session keeps attempts as mastery evidence SSOT and scheduler state operational', () => {
  const session = createSession({ studentName: 'Test', set, now: 1 });
  assert.equal('mastery' in session, false);
  assert.equal('itemStates' in session, false);
  assert.equal(session.currentItemId, 'a');
  assert.equal(session.currentPromptKind, 'main');
  assert.deepEqual(session.retryQueue, []);
  assert.deepEqual(session.attempts, []);
});

test('wrong subtracts mastery, correction stays neutral, and wrong item returns after two other prompts', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });

  let result = answer(session, 'wrong', 10);
  session = result.session;
  assert.equal(result.event.type, 'incorrect_retry');
  assert.equal(result.event.masteryDeltaPercent, -20);
  assert.equal(getSessionMetrics(session, set).mastery, -20);
  assert.equal(session.retryQueue[0].eligiblePromptIndex, 3);

  result = answer(session, 'alpha', 30);
  session = result.session;
  assert.equal(result.event.type, 'correction');
  assert.equal(result.event.masteryDeltaPercent, 0);
  assert.equal(getCurrentItem(session, set).id, 'b');
  assert.equal(session.promptIndex, 1);

  session = answer(session, 'beta', 50).session;
  assert.equal(getCurrentItem(session, set).id, 'c');
  assert.equal(session.promptIndex, 2);

  session = answer(session, 'gamma', 70).session;
  assert.equal(getCurrentItem(session, set).id, 'a');
  assert.equal(session.currentPromptKind, 'retry');
  assert.equal(session.promptIndex, 3);
});

test('second wrong reveals answer, typing revealed answer is correction and does not restore mastery', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'wrong', 10).session;
  const secondWrong = answer(session, 'still wrong', 30);
  session = secondWrong.session;
  assert.equal(secondWrong.event.type, 'incorrect_reveal');
  assert.equal(secondWrong.event.revealAnswer, 'alpha');
  assert.equal(getSessionMetrics(session, set).mastery, -40);

  const correction = submitAnswer({ session, set, answer: 'alpha', attemptMeta: meta(50, 70, 'paste', true), now: 70 });
  session = correction.session;
  assert.equal(correction.event.type, 'correction');
  assert.equal(correction.event.masteryDeltaUnits, 0);
  assert.equal(getSessionMetrics(session, set).mastery, -40);
  const lastAttempt = session.attempts.at(-1);
  assert.equal(lastAttempt.answerRevealedBeforeAttempt, true);
  assert.equal(lastAttempt.pasteDetected, true);
  assert.equal(lastAttempt.inputMethod, 'paste');
});

test('one wrong can recover through retry and only passes after main sequence plus pending retry are complete', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'wrong', 10).session;
  session = answer(session, 'alpha', 30).session;
  session = answer(session, 'beta', 50).session;
  session = answer(session, 'gamma', 70).session;
  assert.equal(getCurrentItem(session, set).id, 'a');
  session = answer(session, 'alpha', 90).session;
  session = answer(session, 'delta', 110).session;
  const final = answer(session, 'echo', 130);
  session = final.session;
  assert.equal(session.status, 'passed');
  assert.equal(getSessionMetrics(session, set).mastery, 80);
  assert.equal(getSessionMetrics(session, set).mainComplete, true);
});

test('below 80 after main sequence automatically continues weak-item review until mastery reaches threshold', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'wrong', 10).session;
  session = answer(session, 'still wrong', 30).session;
  session = answer(session, 'alpha', 50).session;
  session = answer(session, 'beta', 70).session;
  session = answer(session, 'gamma', 90).session;
  session = answer(session, 'alpha', 110).session;
  session = answer(session, 'delta', 130).session;
  session = answer(session, 'echo', 150).session;
  assert.equal(session.status, 'active');
  assert.equal(getSessionMetrics(session, set).mastery, 60);
  assert.equal(session.currentPromptKind, 'review');
  assert.equal(getCurrentItem(session, set).id, 'a');

  const recovered = answer(session, 'alpha', 170);
  assert.equal(recovered.session.status, 'passed');
  assert.equal(getSessionMetrics(recovered.session, set).mastery, 80);
});

test('submission is gated by passed state, while abandon preserves evidence and duration', () => {
  const active = createSession({ studentName: 'Test', set, now: 100 });
  assert.equal(submitPassedSession(active, 200).status, 'active');

  const abandoned = abandonSession(active, 500);
  assert.equal(abandoned.status, 'abandoned');
  assert.equal(abandoned.completedAt, 500);
  assert.equal(getSessionMetrics(abandoned, set).durationMs, 400);
});
