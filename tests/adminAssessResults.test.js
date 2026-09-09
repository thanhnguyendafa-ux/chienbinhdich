import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const adminApp = readFileSync(new URL('../src/assess-admin-app.js', import.meta.url), 'utf8');
const results = readFileSync(new URL('../src/features/assess/adminAssessResults.js', import.meta.url), 'utf8');

test('Assess Admin delegates results rendering to a dedicated controller', () => {
  assert.match(adminApp, /createAdminAssessResults/);
  assert.match(adminApp, /assessResults\.loadResults/);
  assert.doesNotMatch(adminApp, /function\s+renderResultsTable|function\s+applyBaselineLabels/);
});

test('Assess Admin list exposes mode, canonical score, correct\/total and baseline\/retest', () => {
  assert.match(results, /deriveAssessSummary/);
  assert.match(results, /Mode/);
  assert.match(results, /Điểm/);
  assert.match(results, /Đúng\/Tổng/);
  assert.match(results, /BASELINE/);
  assert.match(results, /RETEST/);
});

test('Assess Admin does not implement a second score formula', () => {
  assert.doesNotMatch(results, /correct\s*\/\s*assessableTotal\s*\*\s*100/);
  assert.doesNotMatch(results, /function\s+deriveAssessSummary/);
  assert.doesNotMatch(adminApp, /function\s+deriveAssessSummary/);
});
