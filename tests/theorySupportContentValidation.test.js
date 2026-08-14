import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';

const baseFeedback = { correctLabel: 'A', reason: 'Because', theory: 'Rule', example: 'Example' };
const baseItem = {
  id: 'q1', type: 'mcq', prompt: 'Choose.',
  choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'a',
  teachingFeedback: baseFeedback
};

test('validator accepts declared theory support policies', () => {
  for (const access of ['anytime', 'after_submit']) {
    const errors = validateSet({ id: `set-${access}`, items: [{ ...baseItem, theorySupport: { access } }] });
    assert.deepEqual(errors, []);
  }
});

test('validator rejects unknown theory support policy and missing knowledge source', () => {
  assert.ok(validateSet({ id: 'bad-access', items: [{ ...baseItem, theorySupport: { access: 'always' } }] }).some(error => error.includes('access')));
  const noFeedback = { ...baseItem, teachingFeedback: undefined, theorySupport: { access: 'anytime' } };
  assert.ok(validateSet({ id: 'missing-theory', items: [noFeedback] }).some(error => error.includes('teachingFeedback')));
});

test('classification answer analysis must cover each token exactly once', () => {
  const item = {
    id: 'c1', type: 'classification', prompt: 'Classify.',
    groups: [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }],
    tokens: [{ id: 'one', text: 'one', correctGroupId: 'x' }, { id: 'two', text: 'two', correctGroupId: 'y' }],
    teachingFeedback: {
      ...baseFeedback,
      answerAnalysis: [
        { word: 'one', sound: '/ə/', explanation: 'Reason one' },
        { word: 'two', sound: '/ɜː/', explanation: 'Reason two' }
      ]
    }
  };
  assert.deepEqual(validateSet({ id: 'valid-analysis', items: [item] }), []);
  const missing = structuredClone(item);
  missing.teachingFeedback.answerAnalysis.pop();
  assert.ok(validateSet({ id: 'bad-analysis', items: [missing] }).some(error => error.includes('giải thích đủ')));
});
