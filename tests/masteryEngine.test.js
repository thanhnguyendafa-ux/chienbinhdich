import test from 'node:test';
import assert from 'node:assert/strict';
import { getItemMasteryUnits, getMasteryTransitions, hasReachedMastery, masteryDisplayPercent, masteryPercentFromAttempts, masteryUnitPercent } from '../src/core/masteryEngine.js';

test('mastery uses one equal unit per set item', () => {
  assert.equal(masteryUnitPercent(16), 6.25);
});

test('mastery replays attempts sequentially inside visible 0..100 bounds', () => {
  const attempts = [
    { itemId: 'a', masteryDeltaUnits: -1 },
    { itemId: 'a', masteryDeltaUnits: 0 },
    { itemId: 'b', masteryDeltaUnits: 1 },
    { itemId: 'a', masteryDeltaUnits: 1 }
  ];
  assert.equal(masteryPercentFromAttempts(attempts, 5), 40);
  assert.equal(masteryDisplayPercent(attempts, 5), 40);
  assert.equal(getItemMasteryUnits(attempts, 'a'), 0);
  assert.equal(hasReachedMastery(attempts, 5, 80), false);
});

test('a wrong answer at zero creates no hidden negative debt', () => {
  const attempts = [
    { itemId: 'a', masteryDeltaUnits: -1 },
    { itemId: 'b', masteryDeltaUnits: 1 }
  ];
  assert.equal(masteryPercentFromAttempts(attempts, 16), 6.25);
  assert.deepEqual(getMasteryTransitions(attempts, 16), [
    { before: 0, after: 0, delta: 0 },
    { before: 0, after: 6.25, delta: 6.25 }
  ]);
});

test('mastery caps at 100 but a later retrieval loss visibly moves it backward', () => {
  const attempts = [
    ...Array.from({ length: 6 }, (_, index) => ({ itemId: String(index), masteryDeltaUnits: 1 })),
    { itemId: 'loss', masteryDeltaUnits: -1 }
  ];
  assert.equal(masteryPercentFromAttempts(attempts, 5), 80);
  assert.equal(getMasteryTransitions(attempts, 5).at(-1).delta, -20);
});

test('exactly 80 percent reaches the pass threshold', () => {
  const attempts = Array.from({ length: 4 }, (_, index) => ({ itemId: String(index), masteryDeltaUnits: 1 }));
  assert.equal(masteryPercentFromAttempts(attempts, 5), 80);
  assert.equal(hasReachedMastery(attempts, 5, 80), true);
});
