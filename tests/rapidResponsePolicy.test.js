import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveRapidResponseSignals,
  isRapidResponseAttempt,
  rapidThresholdMsForItem,
  rapidWarningForAttempts
} from '../src/core/rapidResponsePolicy.js';

const mcq = { id: 'm1', type: 'mcq', prompt: 'Choose', choices: [{ id: 'a', text: 'A' }], correctChoiceId: 'a' };
const typingLong = { id: 't1', type: 'typing', vi: 'Dịch', en: 'long answer' };
const typingShort = { id: 't2', type: 'typing', vi: 'Dịch', en: 'cat' };

test('rapid thresholds are question-type aware and ignore short typing answers', () => {
  assert.equal(rapidThresholdMsForItem(mcq), 900);
  assert.equal(rapidThresholdMsForItem(typingLong), 1200);
  assert.equal(rapidThresholdMsForItem(typingShort), null);
  assert.equal(isRapidResponseAttempt({ responseDurationMs: 899 }, mcq), true);
  assert.equal(isRapidResponseAttempt({ responseDurationMs: 900 }, mcq), false);
});

test('one rapid response is logged but does not trigger learner warning', () => {
  const attempts = [{ id: 'a1', itemId: 'm1', responseDurationMs: 500 }];
  const signals = deriveRapidResponseSignals(attempts, { items: [mcq] });
  assert.equal(signals.rapidCount, 1);
  assert.equal(signals.shouldWarn, false);
  assert.equal(rapidWarningForAttempts(attempts, { items: [mcq] }), null);
});

test('two consecutive rapid responses trigger a warning without changing scoring', () => {
  const item2 = { ...mcq, id: 'm2' };
  const attempts = [
    { id: 'a1', itemId: 'm1', responseDurationMs: 500, masteryDeltaUnits: 1 },
    { id: 'a2', itemId: 'm2', responseDurationMs: 600, masteryDeltaUnits: 1 }
  ];
  const warning = rapidWarningForAttempts(attempts, { items: [mcq, item2] });
  assert.equal(warning.type, 'rapid_response');
  assert.equal(warning.occurrenceNumber, 2);
  assert.equal(attempts.reduce((sum, attempt) => sum + attempt.masteryDeltaUnits, 0), 2);
});

test('three rapid responses among the most recent five trigger warning only when current answer is rapid', () => {
  const items = Array.from({ length: 5 }, (_, index) => ({ ...mcq, id: `m${index + 1}` }));
  const durations = [500, 1500, 500, 1500, 500];
  const attempts = items.map((item, index) => ({ itemId: item.id, responseDurationMs: durations[index] }));
  assert.equal(deriveRapidResponseSignals(attempts, { items }).shouldWarn, true);
  const withSlowLast = [...attempts, { itemId: 'm6', responseDurationMs: 1500 }];
  assert.equal(deriveRapidResponseSignals(withSlowLast, { items: [...items, { ...mcq, id: 'm6' }] }).shouldWarn, false);
});
