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
  assert.equal(session.schemaVersion, 4);
  assert.equal('mastery' in session, false);
  assert.equal('itemStates' in session, false);
  assert.equal(session.currentItemId, 'a');
  assert.equal(session.currentPromptKind, 'main');
  assert.deepEqual(session.retryQueue, []);
  assert.deepEqual(session.attempts, []);
});

test('first wrong subtracts mastery once, correction stays neutral, and wrong item returns after two other prompts', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });

  let result = answer(session, 'wrong', 10);
  session = result.session;
  assert.equal(result.event.type, 'incorrect_retry');
  assert.equal(result.event.masteryDeltaPercent, -20);
  assert.equal(getSessionMetrics(session, set).masteryExact, -20);
  assert.equal(getSessionMetrics(session, set).mastery, 0);
  assert.equal(session.retryQueue[0].eligiblePromptIndex, 3);

  result = answer(session, 'alpha', 30);
  session = result.session;
  assert.equal(result.event.type, 'correction');
  assert.equal(result.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, -20);
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

test('second and later wrong attempts in the same exposure are neutral; revealed correction is also neutral', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });

  const firstWrong = answer(session, 'wrong', 10);
  session = firstWrong.session;
  assert.equal(firstWrong.event.masteryDeltaPercent, -20);
  assert.equal(getSessionMetrics(session, set).masteryExact, -20);

  const secondWrong = answer(session, 'still wrong', 30);
  session = secondWrong.session;
  assert.equal(secondWrong.event.type, 'incorrect_reveal');
  assert.equal(secondWrong.event.revealAnswer, 'alpha');
  assert.equal(secondWrong.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, -20);

  const thirdWrong = answer(session, 'wrong again', 50);
  session = thirdWrong.session;
  assert.equal(thirdWrong.event.type, 'incorrect_reveal');
  assert.equal(thirdWrong.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, -20);

  const correction = submitAnswer({ session, set, answer: 'alpha', attemptMeta: meta(70, 90, 'paste', true), now: 90 });
  session = correction.session;
  assert.equal(correction.event.type, 'correction');
  assert.equal(correction.event.masteryDeltaUnits, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, -20);
  const lastAttempt = session.attempts.at(-1);
  assert.equal(lastAttempt.answerRevealedBeforeAttempt, true);
  assert.equal(lastAttempt.pasteDetected, true);
  assert.equal(lastAttempt.inputMethod, 'paste');
});

test('retry is a new exposure: first correct gains mastery, first wrong loses mastery once', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'wrong', 10).session;
  session = answer(session, 'alpha', 30).session;
  session = answer(session, 'beta', 50).session;
  session = answer(session, 'gamma', 70).session;
  assert.equal(session.currentPromptKind, 'retry');

  const retryWrong = answer(session, 'wrong on retry', 90);
  session = retryWrong.session;
  assert.equal(retryWrong.event.masteryDeltaPercent, -20);
  assert.equal(getSessionMetrics(session, set).masteryExact, 0);

  const retrySecondWrong = answer(session, 'still wrong on retry', 110);
  session = retrySecondWrong.session;
  assert.equal(retrySecondWrong.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, 0);
});

test('one wrong can recover through retry and passes at exactly 80 after main sequence plus pending retry are complete', () => {
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
  assert.equal(getSessionMetrics(session, set).masteryExact, 80);
  assert.equal(getSessionMetrics(session, set).thresholdReached, true);
  assert.equal(getSessionMetrics(session, set).mainComplete, true);
});

test('below 80 after main sequence automatically continues weak-item review until mastery reaches threshold', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  const failedMainItems = new Set(['a', 'b']);
  let t = 10;

  for (let guard = 0; guard < 40; guard += 1) {
    const item = getCurrentItem(session, set);
    const exposureAttempts = session.attempts.filter(attempt => attempt.promptIndex === session.promptIndex);

    if (session.currentPromptKind === 'main' && failedMainItems.has(item.id) && exposureAttempts.length === 0) {
      session = answer(session, 'wrong', t).session;
      t += 20;
      session = answer(session, item.en, t).session;
    } else {
      session = answer(session, item.en, t).session;
    }
    t += 20;

    const metrics = getSessionMetrics(session, set);
    if (metrics.mainComplete && session.retryQueue.length === 0 && session.currentPromptKind === 'review') break;
  }

  assert.equal(session.status, 'active');
  assert.equal(getSessionMetrics(session, set).mainComplete, true);
  assert.equal(getSessionMetrics(session, set).masteryExact, 60);
  assert.equal(session.currentPromptKind, 'review');

  const recovered = answer(session, getCurrentItem(session, set).en, t);
  assert.equal(recovered.session.status, 'passed');
  assert.equal(getSessionMetrics(recovered.session, set).masteryExact, 80);
});

test('submission is gated by passed state, while abandon preserves evidence and duration', () => {
  const active = createSession({ studentName: 'Test', set, now: 100 });
  assert.equal(submitPassedSession(active, 200).status, 'active');

  const abandoned = abandonSession(active, 500);
  assert.equal(abandoned.status, 'abandoned');
  assert.equal(abandoned.completedAt, 500);
  assert.equal(getSessionMetrics(abandoned, set).durationMs, 400);
});
