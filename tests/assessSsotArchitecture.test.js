import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const renderer = readFileSync(new URL('../src/features/assess/renderAssess.js', import.meta.url), 'utf8');
const controller = readFileSync(new URL('../src/features/assess/assessSessionController.js', import.meta.url), 'utf8');
const scoring = readFileSync(new URL('../src/core/assessScoringPolicy.js', import.meta.url), 'utf8');
const summary = readFileSync(new URL('../src/core/assessSummary.js', import.meta.url), 'utf8');
const adminApp = readFileSync(new URL('../src/assess-admin-app.js', import.meta.url), 'utf8');
const deliveryRepository = readFileSync(new URL('../src/repositories/assessDeliveryRepository.js', import.meta.url), 'utf8');
const lessonSettings = readFileSync(new URL('../src/repositories/lessonSettingsModel.js', import.meta.url), 'utf8');

test('Assess renderer/controller remain independent of Mastery engines and retry/theory domains', () => {
  for (const source of [renderer, controller]) {
    assert.doesNotMatch(source, /masteryEngine|masteryScoringPolicy|retryScheduler|theorySupport|masteryProgress/);
  }
});

test('Assess percentage has one scoring owner and summary/admin consume it', () => {
  assert.match(scoring, /export function assessPercent/);
  assert.match(summary, /assessPercent\(/);
  assert.match(adminApp, /deriveAssessSummary/);
  assert.doesNotMatch(adminApp, /function\s+assessPercent/);
});

test('lessonSettings never becomes delivery-mode SSOT', () => {
  assert.doesNotMatch(lessonSettings, /deliveryMode/);
});

test('Assess Admin UI does not own delivery validation, content snapshotting or Firestore writes', () => {
  assert.doesNotMatch(adminApp, /createAdminLessonSettingsRepository|loadAdminEffectiveLesson|validateAssessDelivery/);
  assert.match(adminApp, /deliveryRepository\.createDelivery\(setId\)/);
  assert.doesNotMatch(deliveryRepository, /setDoc|getDoc|validateAssessDelivery/);
});
