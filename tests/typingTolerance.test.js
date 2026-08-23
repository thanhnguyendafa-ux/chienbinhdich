import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAnswer } from '../src/core/answerEvaluator.js';
import { evaluateQuestion } from '../src/core/questionTypes.js';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
import {
  DEFAULT_TYPING_TOLERANCE,
  catalogTypingTolerance,
  resolveTypingPolicy,
  sessionTypingTolerance
} from '../src/core/typingPolicy.js';
import { applyLessonMasterySetting, applySessionMasterySnapshot } from '../src/services/effectiveLessonService.js';

const item = { id: 'sentence', stage: 'sentence', vi: 'Ở đó có một con cáo ở nông trại.', en: 'There is a fox on the farm.' };

test('typing stays strict by default', () => {
  assert.equal(DEFAULT_TYPING_TOLERANCE, false);
  assert.equal(evaluateAnswer('There is a fox on the farm.', item.en).correct, true);
  assert.equal(evaluateAnswer('there is a fox on the farm.', item.en).correct, false);
  assert.equal(evaluateAnswer('There is a fox on the farm', item.en).correct, false);
  assert.equal(evaluateQuestion(item, 'there is a fox on the farm').correct, false);
});

test('young learner typing ignores case and sentence punctuation while preserving grammar', () => {
  for (const response of [
    'There is a fox on the farm.',
    'there is a fox on the farm.',
    'There is a fox on the farm',
    'there is a fox on the farm'
  ]) {
    assert.equal(evaluateQuestion(item, response, { typingTolerance: true }).correct, true, response);
  }

  for (const response of [
    'there is fox on the farm',
    'there is a fix on the farm',
    'there are a fox on the farm',
    'there is a fox in the farm',
    'there is a fox on farm'
  ]) {
    assert.equal(evaluateQuestion(item, response, { typingTolerance: true }).correct, false, response);
  }
});

test('young learner tolerance accepts light apostrophe and hyphen variation', () => {
  const answer = { id: 'no', vi: 'Không, ở đó không có.', en: "No, there isn't." };
  assert.equal(evaluateQuestion(answer, "no there isn't", { typingTolerance: true }).correct, true);
  assert.equal(evaluateQuestion(answer, 'no there isnt', { typingTolerance: true }).correct, true);
  assert.equal(evaluateQuestion(answer, 'no there is not', { typingTolerance: true }).correct, true);

  const hyphen = { id: 'game', vi: 'Mình chơi trốn tìm.', en: 'I play hide-and-seek.' };
  assert.equal(evaluateQuestion(hyphen, 'i play hide and seek', { typingTolerance: true }).correct, true);
  assert.equal(evaluateQuestion(hyphen, 'i play football', { typingTolerance: true }).correct, false);
});

test('typing policy resolves catalog default and independent Admin override', () => {
  const strictLesson = { id: 'strict' };
  const youngLesson = { id: 'young', typingTolerance: true };
  assert.equal(catalogTypingTolerance(strictLesson), false);
  assert.equal(catalogTypingTolerance(youngLesson), true);
  assert.deepEqual(resolveTypingPolicy(youngLesson).typingTolerance, true);
  assert.deepEqual(resolveTypingPolicy(youngLesson, { passThreshold: 90 }).typingTolerance, true);
  assert.equal(resolveTypingPolicy(youngLesson, { typingTolerance: false }).typingTolerance, false);
  assert.equal(resolveTypingPolicy(strictLesson, { typingTolerance: true }).typingTolerance, true);
});

test('session snapshots typing tolerance so later Admin changes do not change grading', () => {
  const staticLesson = {
    id: 'young', version: 1, passThreshold: 80, typingTolerance: true,
    items: [item]
  };
  const startedLesson = applyLessonMasterySetting(staticLesson, null);
  const session = createSession({ studentName: 'Lan', set: startedLesson, now: 1 });
  assert.equal(session.schemaVersion, 8);
  assert.equal(session.typingToleranceAtStart, true);

  const adminChangedLesson = applyLessonMasterySetting(staticLesson, { typingTolerance: false });
  assert.equal(adminChangedLesson.typingTolerance, false);
  assert.equal(sessionTypingTolerance(session, adminChangedLesson), true);

  const historicalLesson = applySessionMasterySnapshot(adminChangedLesson, session);
  assert.equal(historicalLesson.typingTolerance, true);

  const result = submitAnswer({
    session,
    set: historicalLesson,
    response: 'there is a fox on the farm',
    attemptMeta: { startedAt: 10, submittedAt: 20 },
    now: 20
  });
  assert.equal(result.event.type, 'retrieval_success');
});

test('legacy Session V7 without typing snapshot stays strict', () => {
  const lesson = { id: 'young', typingTolerance: true };
  assert.equal(sessionTypingTolerance({ schemaVersion: 7 }, lesson), false);
});
