import test from 'node:test';
import assert from 'node:assert/strict';
import { continueQualifiedSession, createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';

function meta(t, inputMethod) {
  return { startedAt: t, submittedAt: t + 5, inputMethod };
}

function makeQuizSet() {
  return {
    id: 'quiz-10',
    version: 1,
    passThreshold: 80,
    items: Array.from({ length: 10 }, (_, index) => ({
      id: `q${index + 1}`,
      type: 'mcq',
      prompt: `Question ${index + 1}`,
      choices: [
        { id: 'a', text: `Correct ${index + 1}` },
        { id: 'b', text: `Wrong ${index + 1}` }
      ],
      correctChoiceId: 'a'
    }))
  };
}

function makeTypingSet() {
  return {
    id: 'typing-16',
    version: 1,
    passThreshold: 80,
    items: Array.from({ length: 16 }, (_, index) => ({
      id: `t${index + 1}`,
      stage: index < 7 ? 'word' : index < 13 ? 'phrase' : 'sentence',
      vi: `mục ${index + 1}`,
      en: `answer${index + 1}`
    }))
  };
}

function submitCurrentCorrect(session, set, t) {
  const item = set.items.find(candidate => candidate.id === session.currentItemId);
  const response = item.type === 'mcq' ? item.correctChoiceId : item.en;
  return submitAnswer({ session, set, response, attemptMeta: meta(t, item.type === 'mcq' ? 'choice' : 'typed'), now: t + 5 });
}

test('10-item quiz Set opens qualification checkpoint immediately at exact 80 percent', () => {
  const set = makeQuizSet();
  let session = createSession({ studentName: 'Quiz Learner', set, now: 1 });

  for (let index = 0; index < 7; index += 1) {
    session = submitCurrentCorrect(session, set, 10 + index * 10).session;
    assert.equal(session.status, 'active');
  }

  const eighth = submitCurrentCorrect(session, set, 80);
  session = eighth.session;
  const metrics = getSessionMetrics(session, set);

  assert.equal(eighth.event.passed, true);
  assert.equal(metrics.masteryExact, 80);
  assert.equal(session.status, 'passed');
  assert.equal(session.mainCursor, 8);
  assert.equal(session.currentItemId, 'q8');
  assert.equal(metrics.completedMainItems, 8);
  assert.equal(metrics.mainComplete, false);
});

test('16-item Typing Set opens qualification checkpoint on the 13th gain at 81.25 percent', () => {
  const set = makeTypingSet();
  let session = createSession({ studentName: 'Typing Learner', set, now: 1 });

  for (let index = 0; index < 12; index += 1) {
    session = submitCurrentCorrect(session, set, 10 + index * 10).session;
    assert.equal(session.status, 'active');
  }
  assert.equal(getSessionMetrics(session, set).masteryExact, 75);

  const thirteenth = submitCurrentCorrect(session, set, 140);
  session = thirteenth.session;
  const metrics = getSessionMetrics(session, set);

  assert.equal(thirteenth.event.passed, true);
  assert.equal(metrics.masteryExact, 81.25);
  assert.equal(session.status, 'passed');
  assert.equal(session.currentItemId, 't13');
  assert.equal(session.mainCursor, 13);
  assert.equal(metrics.completedMainItems, 13);
});

test('Làm tiếp resumes unfinished main sequence instead of skipping directly to generic review', () => {
  const set = makeQuizSet();
  let session = createSession({ studentName: 'Continue Learner', set, now: 1 });
  for (let index = 0; index < 8; index += 1) session = submitCurrentCorrect(session, set, 10 + index * 10).session;
  assert.equal(session.status, 'passed');

  const extended = continueQualifiedSession(session, set, 500);
  assert.equal(extended.status, 'extended');
  assert.equal(extended.currentPromptKind, 'main');
  assert.equal(extended.currentItemId, 'q9');
  assert.equal(extended.mainCursor, 9);
});
