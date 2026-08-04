import test from 'node:test';
import assert from 'node:assert/strict';
import { getItemMasteryUnits, hasReachedMastery, masteryPercentFromAttempts, masteryUnitPercent } from '../src/core/masteryEngine.js';

test('mastery uses one equal unit per set item', () => {
  assert.equal(masteryUnitPercent(16), 6.25);
});

test('retrieval gains, retrieval losses and correction neutrality derive from attempts', () => {
  const attempts = [
    { itemId: 'a', masteryDeltaUnits: -1 },
    { itemId: 'a', masteryDeltaUnits: 0 },
    { itemId: 'b', masteryDeltaUnits: 1 },
    { itemId: 'a', masteryDeltaUnits: 1 }
  ];
  assert.equal(masteryPercentFromAttempts(attempts, 5), 20);
  assert.equal(getItemMasteryUnits(attempts, 'a'), 0);
  assert.equal(hasReachedMastery(attempts, 5, 80), false);
});
