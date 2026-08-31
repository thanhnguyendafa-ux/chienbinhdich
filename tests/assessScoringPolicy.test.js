import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessPercent,
  assessableItems,
  validateAssessDelivery
} from '../src/core/assessScoringPolicy.js';

test('Assess admits objective accuracy items and rejects open/completion-only work', () => {
  const set = {
    items: [
      { id: 't', type: 'typing', vi: 'Xin chào', en: 'Hello.' },
      { id: 'm', type: 'mcq', prompt: 'Pick', choices: [{ id: 'a', text: 'A' }], correctChoiceId: 'a' },
      { id: 'o', type: 'typing', vi: 'Write', en: 'Sample', responseMode: 'open' },
      { id: 'c', type: 'typing', vi: 'Say', en: 'Hi', masteryMode: 'completion' }
    ]
  };
  assert.deepEqual(assessableItems(set).map(item => item.id), ['t', 'm']);
  assert.equal(validateAssessDelivery(set), 2);
});

test('Assess percentage is deterministic and has no negative score', () => {
  assert.equal(assessPercent(8, 19), 42.11);
  assert.equal(assessPercent(-2, 10), 0);
  assert.equal(assessPercent(20, 10), 100);
});

test('zero-assessable delivery is rejected before issue', () => {
  assert.throws(
    () => validateAssessDelivery({ items: [{ id: 'open', type: 'typing', responseMode: 'open', vi: 'x' }] }),
    error => error.code === 'assess_no_gradable_items'
  );
});
