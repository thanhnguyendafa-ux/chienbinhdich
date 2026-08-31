import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activeStudyMs,
  effortQualification,
  isValidEffortPassMinutes,
  resolveEffortPassPolicy,
  sessionEffortPassPolicy
} from '../src/core/effortPassPolicy.js';

test('Effort Timer accepts only integer minutes from 5 through 60', () => {
  assert.equal(isValidEffortPassMinutes(5), true);
  assert.equal(isValidEffortPassMinutes(60), true);
  assert.equal(isValidEffortPassMinutes(4), false);
  assert.equal(isValidEffortPassMinutes(61), false);
  assert.equal(isValidEffortPassMinutes(10.5), false);
});

test('active study clock subtracts recorded and currently hidden tab-away time', () => {
  const session = {
    startedAt: 0,
    attempts: [{}],
    integrity: { tabAwayMs: 120_000, hiddenAt: 540_000 }
  };
  assert.equal(activeStudyMs(session, 600_000), 420_000);
});

test('effort qualification requires enabled policy, one attempt, and full active target', () => {
  const lesson = {
    effortPassPolicy: { enabled: true, minutes: 10, targetMs: 600_000 },
    effortPassEnabled: true,
    effortPassMinutes: 10
  };
  const base = { startedAt: 0, attempts: [{}], integrity: { tabAwayMs: 0, hiddenAt: null } };
  assert.equal(effortQualification(base, lesson, 599_999).reached, false);
  assert.equal(effortQualification(base, lesson, 600_000).reached, true);
  assert.equal(effortQualification({ ...base, attempts: [] }, lesson, 600_000).reached, false);
});

test('session snapshot keeps original Effort Timer after Admin setting changes', () => {
  const currentLesson = {
    effortPassEnabled: true,
    effortPassMinutes: 20,
    effortPassPolicy: resolveEffortPassPolicy({}, { effortPassEnabled: true, effortPassMinutes: 20 })
  };
  const session = { effortPassEnabledAtStart: true, effortTargetMinutesAtStart: 10 };
  const policy = sessionEffortPassPolicy(session, currentLesson);
  assert.equal(policy.enabled, true);
  assert.equal(policy.minutes, 10);
  assert.equal(policy.targetMs, 600_000);
});
