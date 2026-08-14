import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
import { theoryAccessForItem, theoryUnlockedForExposure, theorySupportViewModel } from '../src/features/drill/theorySupport.js';

const feedback = {
  correctLabel: 'A',
  reason: 'Because / Vì',
  theory: 'Rule / Quy luật',
  example: 'Example / Ví dụ'
};

const anytimeItem = {
  id: 'q-anytime', type: 'mcq', prompt: 'Choose / Chọn',
  choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'a',
  theorySupport: { access: 'anytime' }, teachingFeedback: feedback
};
const lockedItem = {
  id: 'q-locked', type: 'mcq', prompt: 'Choose / Chọn',
  choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'a',
  theorySupport: { access: 'after_submit' }, teachingFeedback: feedback
};

test('theory support exposes only the two declared access policies', () => {
  assert.equal(theoryAccessForItem(anytimeItem), 'anytime');
  assert.equal(theoryAccessForItem(lockedItem), 'after_submit');
  assert.equal(theoryAccessForItem({}), null);
});

test('anytime theory is unlocked before answering', () => {
  const set = { id: 's', items: [anytimeItem] };
  const session = createSession({ studentName: 'MRT', set, now: 1 });
  assert.equal(theoryUnlockedForExposure({ item: anytimeItem, session }), true);
  assert.equal(theorySupportViewModel({ item: anytimeItem, session })?.unlocked, true);
});

test('after-submit theory locks before the first attempt and unlocks after one submit', () => {
  const set = { id: 's', items: [lockedItem], passThreshold: 80 };
  const session = createSession({ studentName: 'MRT', set, now: 1 });
  assert.equal(theoryUnlockedForExposure({ item: lockedItem, session }), false);
  const result = submitAnswer({ session, set, response: 'b', now: 2 });
  assert.equal(result.event.type, 'incorrect_retry');
  assert.equal(theoryUnlockedForExposure({ item: lockedItem, session: result.session }), true);
});

test('after-submit theory is keyed to promptIndex so a new exposure re-locks', () => {
  const session = {
    promptIndex: 4,
    attempts: [{ promptIndex: 3, itemId: 'q-locked' }]
  };
  assert.equal(theoryUnlockedForExposure({ item: lockedItem, session }), false);
  const attemptedCurrent = { ...session, attempts: [...session.attempts, { promptIndex: 4, itemId: 'q-locked' }] };
  assert.equal(theoryUnlockedForExposure({ item: lockedItem, session: attemptedCurrent }), true);
});

test('theory view model reuses knowledge-only teaching feedback and does not expose the answer', () => {
  const vm = theorySupportViewModel({ item: anytimeItem, session: { promptIndex: 0, attempts: [] } });
  assert.equal(vm.theory, feedback.theory);
  assert.equal(vm.example, feedback.example);
  assert.equal(Object.hasOwn(vm, 'correctLabel'), false);
  assert.equal(Object.hasOwn(vm, 'reason'), false);
});
