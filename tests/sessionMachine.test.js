import test from 'node:test';
import assert from 'node:assert/strict';
import { abandonSession, continueQualifiedSession, createSession, getCurrentItem, getSessionMetrics, qualifySessionIfEligible, submitAnswer, submitPassedSession } from '../src/core/sessionMachine.js';

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

function answer(session, value, t, lesson = set) {
  return submitAnswer({ session, set: lesson, answer: value, attemptMeta: meta(t, t + 10), now: t + 10 });
}

function passCleanly() {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'alpha', 10).session;
  session = answer(session, 'beta', 30).session;
  session = answer(session, 'gamma', 50).session;
  session = answer(session, 'delta', 70).session;
  return session;
}

test('session keeps attempts as mastery evidence SSOT and snapshots grading contract at start', () => {
  const session = createSession({ studentName: 'Test', set, now: 1 });
  assert.equal(session.schemaVersion, 8);
  assert.equal(session.assessmentPolicyAtStart, null);
  assert.equal(session.assessmentContractVersionAtStart, null);
  assert.equal(session.completionPolicyAtStart, null);
  assert.equal('mastery' in session, false);
  assert.equal('itemStates' in session, false);
  assert.equal(session.currentItemId, 'a');
  assert.equal(session.currentPromptKind, 'main');
  assert.equal(session.qualifiedAt, null);
  assert.deepEqual(session.retryQueue, []);
  assert.deepEqual(session.attempts, []);
});

test('first wrong at zero stays at zero, correction stays neutral, and wrong item returns after two other prompts', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });

  let result = answer(session, 'wrong', 10);
  session = result.session;
  assert.equal(result.event.type, 'incorrect_retry');
  assert.equal(result.event.masteryDeltaUnits, -1);
  assert.equal(result.event.masteryBefore, 0);
  assert.equal(result.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, 0);
  assert.equal(session.retryQueue[0].eligiblePromptIndex, 3);

  result = answer(session, 'alpha', 30);
  session = result.session;
  assert.equal(result.event.type, 'correction');
  assert.equal(result.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, 0);
  assert.equal(getCurrentItem(session, set).id, 'b');

  result = answer(session, 'beta', 50);
  session = result.session;
  assert.equal(result.event.masteryDeltaPercent, 20);
  assert.equal(getSessionMetrics(session, set).masteryExact, 20);

  session = answer(session, 'gamma', 70).session;
  assert.equal(getCurrentItem(session, set).id, 'a');
  assert.equal(session.currentPromptKind, 'retry');
  assert.equal(session.promptIndex, 3);
});

test('second and later wrong attempts in the same exposure are neutral; revealed correction is also neutral', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'alpha', 10).session;
  assert.equal(getSessionMetrics(session, set).masteryExact, 20);

  const firstWrong = answer(session, 'wrong', 30);
  session = firstWrong.session;
  assert.equal(firstWrong.event.masteryDeltaUnits, -1);
  assert.equal(firstWrong.event.masteryDeltaPercent, -20);
  assert.equal(getSessionMetrics(session, set).masteryExact, 0);

  const secondWrong = answer(session, 'still wrong', 50);
  session = secondWrong.session;
  assert.equal(secondWrong.event.type, 'incorrect_reveal');
  assert.equal(secondWrong.event.revealAnswer, 'beta');
  assert.equal(secondWrong.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(session, set).masteryExact, 0);

  const thirdWrong = answer(session, 'wrong again', 70);
  session = thirdWrong.session;
  assert.equal(thirdWrong.event.masteryDeltaPercent, 0);

  const correction = submitAnswer({ session, set, answer: 'beta', attemptMeta: meta(90, 110, 'paste', true), now: 110 });
  session = correction.session;
  assert.equal(correction.event.type, 'correction');
  assert.equal(correction.event.masteryDeltaUnits, 0);
  assert.equal(correction.event.masteryDeltaPercent, 0);
  const lastAttempt = session.attempts.at(-1);
  assert.equal(lastAttempt.answerRevealedBeforeAttempt, true);
  assert.equal(lastAttempt.pasteDetected, true);
});

test('retry is a new exposure: first correct gains mastery and first wrong loses mastery once', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'wrong', 10).session;
  session = answer(session, 'alpha', 30).session;
  session = answer(session, 'beta', 50).session;
  session = answer(session, 'gamma', 70).session;
  assert.equal(session.currentPromptKind, 'retry');
  assert.equal(getSessionMetrics(session, set).masteryExact, 40);

  const retryWrong = answer(session, 'wrong on retry', 90);
  session = retryWrong.session;
  assert.equal(retryWrong.event.masteryDeltaPercent, -20);
  assert.equal(getSessionMetrics(session, set).masteryExact, 20);

  const retrySecondWrong = answer(session, 'still wrong on retry', 110);
  assert.equal(retrySecondWrong.event.masteryDeltaPercent, 0);
  assert.equal(getSessionMetrics(retrySecondWrong.session, set).masteryExact, 20);
});

test('crossing 80 qualifies immediately before remaining main items advance', () => {
  let session = createSession({ studentName: 'Test', set, now: 1 });
  session = answer(session, 'alpha', 10).session;
  session = answer(session, 'beta', 30).session;
  session = answer(session, 'gamma', 50).session;
  const threshold = answer(session, 'delta', 70);
  session = threshold.session;

  assert.equal(threshold.event.passed, true);
  assert.equal(session.status, 'passed');
  assert.equal(session.qualifiedAt, 80);
  assert.equal(getSessionMetrics(session, set).masteryExact, 80);
  assert.equal(getSessionMetrics(session, set).completedMainItems, 4);
  assert.equal(getSessionMetrics(session, set).mainComplete, false);
  assert.equal(session.currentItemId, 'd', 'checkpoint should preserve the just-completed prompt');
  assert.equal(session.mainCursor, 4, 'next main item must remain pending until learner chooses Làm tiếp');
});

test('a completed main sequence at 60 stays active in review and passes at exactly 80', () => {
  const session = {
    ...createSession({ studentName: 'Test', set, now: 1 }),
    currentItemId: 'a',
    currentPromptKind: 'review',
    promptIndex: 10,
    mainCursor: set.items.length,
    attempts: set.items.map((item, index) => ({
      id: `seed-${index}`,
      itemId: item.id,
      promptIndex: index,
      promptKind: 'main',
      attemptNumber: 1,
      correct: true,
      result: index < 3 ? 'retrieval_success' : 'correction',
      masteryDeltaUnits: index < 3 ? 1 : 0,
      submittedAt: 100 + index,
      answerRevealedAfterAttempt: index >= 3
    }))
  };

  assert.equal(getSessionMetrics(session, set).mainComplete, true);
  assert.equal(getSessionMetrics(session, set).masteryExact, 60);
  assert.equal(session.status, 'active');

  const recovered = answer(session, 'alpha', 200);
  assert.equal(recovered.session.status, 'passed');
  assert.equal(recovered.session.qualifiedAt, 210);
  assert.equal(getSessionMetrics(recovered.session, set).masteryExact, 80);
});

test('qualified learner continues from preserved scheduler state before generic review', () => {
  const passed = passCleanly();
  assert.equal(passed.status, 'passed');
  assert.equal(getSessionMetrics(passed, set).masteryExact, 80);
  assert.equal(passed.mainCursor, 4);

  let extended = continueQualifiedSession(passed, set, 500);
  assert.equal(extended.status, 'extended');
  assert.equal(extended.extendedPracticeStartedAt, 500);
  assert.equal(extended.currentPromptKind, 'main');
  assert.equal(getCurrentItem(extended, set).id, 'e');

  extended = answer(extended, 'echo', 600).session;
  assert.equal(extended.status, 'extended');
  assert.equal(getSessionMetrics(extended, set).masteryExact, 100);

  const submitted = submitPassedSession(extended, 800);
  const metrics = getSessionMetrics(submitted, set, 800);
  assert.equal(submitted.status, 'submitted');
  assert.equal(submitted.extendedPracticeEndedAt, 800);
  assert.equal(metrics.extendedPractice, true);
  assert.equal(metrics.extendedAttempts, 1);
  assert.equal(metrics.extendedPracticeDurationMs, 300);
  assert.equal(metrics.completedMainItems, 5);
});

test('persisted active session already above threshold reconciles to passed using first crossing time', () => {
  const active = {
    ...createSession({ studentName: 'Legacy', set, now: 1 }),
    currentItemId: 'e',
    mainCursor: 4,
    promptIndex: 3,
    attempts: ['a', 'b', 'c', 'd'].map((itemId, index) => ({
      id: `legacy-${index}`,
      itemId,
      promptIndex: index,
      promptKind: 'main',
      attemptNumber: 1,
      correct: true,
      result: 'retrieval_success',
      masteryDeltaUnits: 1,
      submittedAt: 100 + index * 10
    }))
  };

  assert.equal(active.status, 'active');
  assert.equal(getSessionMetrics(active, set).masteryExact, 80);
  const reconciled = qualifySessionIfEligible(active, set);
  assert.equal(reconciled.status, 'passed');
  assert.equal(reconciled.qualifiedAt, 130);
  assert.equal(reconciled.currentItemId, active.currentItemId);
  assert.equal(reconciled.mainCursor, active.mainCursor);
});

test('qualification remains valid after continued practice later lowers current mastery', () => {
  const passed = passCleanly();
  let extended = continueQualifiedSession(passed, set, 500);
  const loss = answer(extended, 'wrong', 600);
  extended = loss.session;
  assert.equal(extended.status, 'extended');
  assert.equal(getSessionMetrics(extended, set).masteryExact, 60);
  assert.equal(getSessionMetrics(extended, set).passed, true);
  assert.equal(getSessionMetrics(extended, set).qualifiedAt, passed.qualifiedAt);
  assert.equal(submitPassedSession(extended, 800).status, 'submitted');
});

test('submission is gated by qualification, while abandon preserves evidence and duration', () => {
  const active = createSession({ studentName: 'Test', set, now: 100 });
  assert.equal(submitPassedSession(active, 200).status, 'active');

  const passed = passCleanly();
  assert.equal(submitPassedSession(passed, 300).status, 'submitted');

  const abandoned = abandonSession(active, 500);
  assert.equal(abandoned.status, 'abandoned');
  assert.equal(abandoned.completedAt, 500);
  assert.equal(getSessionMetrics(abandoned, set).durationMs, 400);
});
