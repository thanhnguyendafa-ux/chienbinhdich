import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';
import { createSession, getCurrentItem, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';

const set = await loadLessonSet('g7-u1-mixed-demo');

function submit(session, response, t, inputMethod = 'choice') {
  return submitAnswer({
    session,
    set,
    response,
    attemptMeta: { startedAt: t, submittedAt: t + 10, inputMethod, pasteDetected: false },
    now: t + 10
  });
}

test('Sample A validates as one Set with MCQ, True/False and Sentence Order', () => {
  assert.deepEqual(validateSet(set), []);
  assert.equal(set.items.length, 10);
  assert.deepEqual([...new Set(set.items.map(item => item.type))], ['mcq', 'true_false', 'sentence_order']);
});

test('mixed question types share one Mastery bar and retry scheduler', () => {
  let session = createSession({ studentName: 'Lucky', set, now: 1 });

  let result = submit(session, 'a', 10);
  session = result.session;
  assert.equal(result.event.mastery, 10);
  assert.equal(getCurrentItem(session, set).id, 'mix-q2');

  result = submit(session, true, 30);
  session = result.session;
  assert.equal(result.event.mastery, 20);
  assert.equal(getCurrentItem(session, set).id, 'mix-q3');

  result = submit(session, ['I', 'gardening.', 'like'], 50, 'tap');
  session = result.session;
  assert.equal(result.event.type, 'incorrect_retry');
  assert.equal(result.event.mastery, 10);

  result = submit(session, ['I', 'like', 'gardening.'], 70, 'tap');
  session = result.session;
  assert.equal(result.event.type, 'correction');
  assert.equal(result.event.masteryDeltaPercent, 0);
  assert.equal(getCurrentItem(session, set).id, 'mix-q4');

  session = submit(session, 'a', 90).session;
  assert.equal(getSessionMetrics(session, set).mastery, 20);
  assert.equal(getCurrentItem(session, set).id, 'mix-q5');

  session = submit(session, true, 110).session;
  assert.equal(getSessionMetrics(session, set).mastery, 30);
  assert.equal(getCurrentItem(session, set).id, 'mix-q3');
  assert.equal(session.currentPromptKind, 'retry');

  result = submit(session, ['I', 'like', 'gardening.'], 130, 'tap');
  session = result.session;
  assert.equal(result.event.masteryDeltaPercent, 10);
  assert.equal(getSessionMetrics(session, set).mastery, 40);

  const types = session.attempts.map(attempt => attempt.questionType);
  assert.deepEqual(types.slice(0, 7), ['mcq', 'true_false', 'sentence_order', 'sentence_order', 'mcq', 'true_false', 'sentence_order']);
});

test('mixed attempt evidence records display response and normalized response per type', () => {
  let session = createSession({ studentName: 'Lucky', set, now: 1 });
  session = submit(session, 'a', 10).session;
  assert.equal(session.attempts[0].submittedResponse, 'a');
  assert.equal(session.attempts[0].submittedAnswer, 'gardening');
  assert.equal(session.attempts[0].questionType, 'mcq');

  session = submit(session, true, 30).session;
  assert.equal(session.attempts[1].submittedResponse, true);
  assert.equal(session.attempts[1].submittedAnswer, 'TRUE');
});
