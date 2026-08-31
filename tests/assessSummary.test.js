import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveAssessSummary } from '../src/core/assessSummary.js';

const set = {
  items: [
    { id: 'q1', type: 'typing', vi: 'Một con mèo', en: 'A cat.' },
    {
      id: 'q2',
      type: 'mcq',
      prompt: 'Choose',
      choices: [{ id: 'a', text: 'One' }, { id: 'b', text: 'Two' }],
      correctChoiceId: 'b'
    },
    { id: 'q3', type: 'true_false', statement: 'Sky is green.', answer: false }
  ]
};

test('Assess summary derives correct/incorrect/unanswered from first canonical attempt per item', () => {
  const summary = deriveAssessSummary([
    { id: '1', itemId: 'q1', submittedResponse: 'A cat.', submittedAnswer: 'A cat.', submittedAt: 1 },
    { id: '2', itemId: 'q2', submittedResponse: 'a', submittedAnswer: 'One', submittedAt: 2 }
  ], set);
  assert.equal(summary.correct, 1);
  assert.equal(summary.incorrect, 1);
  assert.equal(summary.unanswered, 1);
  assert.equal(summary.assessableTotal, 3);
  assert.equal(summary.percent, 33.33);
  assert.equal(summary.details[0].expectedAnswer, 'A cat.');
});

test('later duplicate attempts cannot rewrite baseline result', () => {
  const summary = deriveAssessSummary([
    { id: 'first', itemId: 'q1', submittedResponse: 'wrong', submittedAt: 1 },
    { id: 'later', itemId: 'q1', submittedResponse: 'A cat.', submittedAt: 2 }
  ], { items: [set.items[0]] });
  assert.equal(summary.correct, 0);
  assert.equal(summary.incorrect, 1);
});
