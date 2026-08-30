import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceAssessSession,
  assessProgress,
  currentAssessItem,
  submitAssessSession
} from '../src/features/assess/assessSessionController.js';

test('Assess advances exactly once with no retry/correction or Mastery qualification state', () => {
  const lesson = { items: [{ id: 'q1' }, { id: 'q2' }] };
  const start = { id: 's', status: 'active', currentItemIndex: 0, currentItemId: 'q1', attemptCount: 0 };
  const after = advanceAssessSession(start, lesson, { attemptId: 'a1', now: 10 });
  assert.equal(currentAssessItem(after, lesson).id, 'q2');
  assert.equal(assessProgress(after, lesson).number, 2);
  assert.equal(after.attemptCount, 1);
  assert.equal('retryQueue' in after, false);
  assert.equal('qualifiedAt' in after, false);
  assert.equal('mastery' in after, false);
});

test('Assess submission is neutral status completion, not PASS', () => {
  const submitted = submitAssessSession({ id: 's', status: 'active' }, 20);
  assert.equal(submitted.status, 'submitted');
  assert.equal(submitted.submittedAt, 20);
  assert.equal('qualifiedAt' in submitted, false);
});
