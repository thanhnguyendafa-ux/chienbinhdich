import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
import { theoryUnlockedForExposure } from '../src/features/drill/theorySupport.js';

const item = {
  id: 'c1', type: 'classification', prompt: 'Classify / Phân loại',
  groups: [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }],
  tokens: [{ id: 'one', text: 'one', correctGroupId: 'x' }, { id: 'two', text: 'two', correctGroupId: 'y' }],
  classificationKind: 'generic',
  theorySupport: { access: 'after_submit' },
  teachingFeedback: { correctLabel: 'X/Y', reason: 'Reason', theory: 'Rule', example: 'Example' }
};

test('first wrong classification unlocks theory while correct answer remains hidden', () => {
  const set = { id: 'set', items: [item], passThreshold: 80 };
  const session = createSession({ studentName: 'MRT', set, now: 1 });
  const firstWrong = submitAnswer({
    session,
    set,
    response: { one: 'y', two: 'x' },
    now: 2
  });
  assert.equal(firstWrong.event.type, 'incorrect_retry');
  assert.equal(firstWrong.event.revealAnswer, null);
  assert.equal(theoryUnlockedForExposure({ item, session: firstWrong.session }), true);
});
