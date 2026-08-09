import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PASS_THRESHOLD,
  catalogPassThreshold,
  isValidPassThreshold,
  resolveMasteryPolicy,
  sessionPassThreshold,
  validatePassThreshold
} from '../src/core/masteryPolicy.js';
import { createSession, qualifySessionIfEligible } from '../src/core/sessionMachine.js';
import {
  applyLessonMasterySetting,
  applyLessonMasterySettings,
  applySessionMasterySnapshot
} from '../src/services/effectiveLessonService.js';

const tenItems = Array.from({ length: 10 }, (_, index) => ({ id: `q${index + 1}` }));

function lesson(overrides = {}) {
  return {
    id: 'lesson-1',
    version: 1,
    title: 'Lesson',
    lessonSlug: 'lesson-1',
    passThreshold: 80,
    completionPolicy: 'all-items',
    items: tenItems,
    ...overrides
  };
}

test('Mastery policy has one 80% default and accepts integer thresholds from 1 to 100', () => {
  assert.equal(DEFAULT_PASS_THRESHOLD, 80);
  assert.equal(catalogPassThreshold({}), 80);
  assert.equal(isValidPassThreshold(1), true);
  assert.equal(isValidPassThreshold(100), true);
  assert.equal(isValidPassThreshold(80.5), false);
  assert.equal(isValidPassThreshold(0), false);
  assert.equal(isValidPassThreshold(101), false);
  assert.deepEqual(validatePassThreshold(90), []);
  assert.ok(validatePassThreshold(80.5).length > 0);
});

test('effective lesson uses admin override without changing the fixed slug', () => {
  const base = lesson();
  const effective = applyLessonMasterySetting(base, {
    setId: base.id,
    passThreshold: 90,
    updatedAt: 123,
    updatedBy: 'admin-1'
  });
  assert.equal(effective.passThreshold, 90);
  assert.equal(effective.lessonSlug, base.lessonSlug);
  assert.equal(effective.masteryPolicy.defaultThreshold, 80);
  assert.equal(effective.masteryPolicy.source, 'admin-override');

  const reset = applyLessonMasterySetting(base, null);
  assert.equal(reset.passThreshold, 80);
  assert.equal(reset.masteryPolicy.source, 'catalog');
});

test('descriptor decoration applies settings only to matching lessons', () => {
  const decorated = applyLessonMasterySettings([
    lesson({ id: 'a', lessonSlug: 'a' }),
    lesson({ id: 'b', lessonSlug: 'b' })
  ], [{ setId: 'b', passThreshold: 70, updatedAt: 1, updatedBy: 'admin' }]);
  assert.equal(decorated[0].passThreshold, 80);
  assert.equal(decorated[1].passThreshold, 70);
});

test('new sessions snapshot the effective target and keep it when current lesson target changes', () => {
  const atStart = applyLessonMasterySetting(lesson(), { setId: 'lesson-1', passThreshold: 90 });
  const session = createSession({ studentName: 'An', set: atStart, now: 100 });
  assert.equal(session.passThresholdAtStart, 90);

  const currentLesson = applyLessonMasterySetting(lesson(), { setId: 'lesson-1', passThreshold: 70 });
  const historicalLesson = applySessionMasterySnapshot(currentLesson, session);
  assert.equal(historicalLesson.passThreshold, 90);
  assert.equal(historicalLesson.masteryPolicy.currentThreshold, 70);
  assert.equal(sessionPassThreshold(session, currentLesson), 90);
});

test('legacy Session V7 without a threshold snapshot deterministically keeps the historical 80% target', () => {
  const legacy = { schemaVersion: 7, id: 'legacy' };
  assert.equal(sessionPassThreshold(legacy, lesson({ passThreshold: 95 })), 80);
});

test('qualification uses the session snapshot instead of a later live lesson target', () => {
  const attemptsAt80 = Array.from({ length: 8 }, (_, index) => ({
    masteryDeltaUnits: 1,
    submittedAt: index + 1
  }));
  const baseSession = {
    schemaVersion: 7,
    status: 'active',
    mainCursor: 10,
    attempts: attemptsAt80,
    passThresholdAtStart: 90,
    qualifiedAt: null
  };
  const currentLesson = lesson({ passThreshold: 70 });
  assert.equal(qualifySessionIfEligible(baseSession, currentLesson).status, 'active');

  const threshold80Session = { ...baseSession, passThresholdAtStart: 80 };
  const passed = qualifySessionIfEligible(threshold80Session, currentLesson);
  assert.equal(passed.status, 'passed');
  assert.equal(passed.qualifiedAt, 8);
});

test('resolveMasteryPolicy rejects corrupt persisted overrides instead of silently falling back', () => {
  assert.throws(() => resolveMasteryPolicy(lesson(), { passThreshold: 120 }), /không hợp lệ/);
});
