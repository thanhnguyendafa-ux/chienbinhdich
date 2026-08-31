import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, getSessionMetrics, qualifySessionIfEligible } from '../src/core/sessionMachine.js';
import { applyLessonMasterySetting } from '../src/services/effectiveLessonService.js';

const items = Array.from({ length: 10 }, (_, index) => ({ id: `q${index + 1}` }));

function lesson(setting = null) {
  return applyLessonMasterySetting({
    id: 'effort-lesson',
    version: 1,
    title: 'Effort lesson',
    passThreshold: 80,
    completionPolicy: 'all-items',
    items
  }, setting);
}

function activeSession(overrides = {}) {
  return {
    schemaVersion: 8,
    status: 'active',
    startedAt: 0,
    mainCursor: 1,
    attempts: [{ id: 'a1', itemId: 'q1', masteryDeltaUnits: 0, submittedAt: 1 }],
    passThresholdAtStart: 80,
    effortPassEnabledAtStart: true,
    effortTargetMinutesAtStart: 10,
    qualifiedAt: null,
    integrity: { tabAwayMs: 0, hiddenAt: null },
    ...overrides
  };
}

test('new Mastery sessions explicitly snapshot delivery and Effort policy', () => {
  const set = lesson({ effortPassEnabled: true, effortPassMinutes: 10 });
  const session = createSession({ studentName: 'An', set, now: 1000 });
  assert.equal(session.deliveryModeAtStart, 'mastery');
  assert.equal(session.deliveryContractVersionAtStart, 1);
  assert.equal(session.effortPassEnabledAtStart, true);
  assert.equal(session.effortTargetMinutesAtStart, 10);
  assert.equal(session.instructionsAcknowledgedAt, 1000);
});

test('9:59 active study does not PASS but 10:00 does PASS by EFFORT', () => {
  const set = lesson({ effortPassEnabled: true, effortPassMinutes: 10 });
  const before = qualifySessionIfEligible(activeSession(), set, 599_999);
  assert.equal(before.status, 'active');

  const passed = qualifySessionIfEligible(activeSession(), set, 600_000);
  assert.equal(passed.status, 'passed');
  assert.equal(passed.qualificationReason, 'effort');
  assert.equal(passed.effortMsAtQualification, 600_000);
  const metrics = getSessionMetrics(passed, set, 600_000);
  assert.equal(metrics.mastery, 0);
  assert.equal(metrics.effortThresholdReached, true);
});

test('tab-away time cannot be used to reach the Effort target', () => {
  const set = lesson({ effortPassEnabled: true, effortPassMinutes: 10 });
  const session = activeSession({ integrity: { tabAwayMs: 300_000, hiddenAt: null } });
  assert.equal(qualifySessionIfEligible(session, set, 600_000).status, 'active');
  assert.equal(qualifySessionIfEligible(session, set, 900_000).qualificationReason, 'effort');
});

test('Mastery reaching 80% first wins qualification reason without waiting for Timer', () => {
  const set = lesson({ effortPassEnabled: true, effortPassMinutes: 10 });
  const attempts = Array.from({ length: 8 }, (_, index) => ({ masteryDeltaUnits: 1, submittedAt: index + 1 }));
  const session = activeSession({ mainCursor: 10, attempts, startedAt: 0 });
  const passed = qualifySessionIfEligible(session, set, 60_000);
  assert.equal(passed.status, 'passed');
  assert.equal(passed.qualificationReason, 'mastery');
  assert.equal(passed.effortMsAtQualification, null);
});

test('Timer OFF preserves existing Mastery-only behavior', () => {
  const set = lesson({ effortPassEnabled: false, effortPassMinutes: 10 });
  const session = activeSession({ effortPassEnabledAtStart: false, effortTargetMinutesAtStart: 10 });
  assert.equal(qualifySessionIfEligible(session, set, 3_600_000).status, 'active');
});
