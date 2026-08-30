import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const adminApp = readFileSync(new URL('../src/assess-admin-app.js', import.meta.url), 'utf8');

test('Assess Admin list exposes mode, canonical score, correct/total and baseline/retest', () => {
  assert.match(adminApp, /deriveAssessSummary/);
  assert.match(adminApp, /Mode/);
  assert.match(adminApp, /Điểm/);
  assert.match(adminApp, /Đúng\/Tổng/);
  assert.match(adminApp, /BASELINE/);
  assert.match(adminApp, /RETEST/);
});

test('Assess Admin does not implement a second score formula', () => {
  assert.doesNotMatch(adminApp, /correct\s*\/\s*assessableTotal\s*\*\s*100/);
  assert.doesNotMatch(adminApp, /function\s+deriveAssessSummary/);
});
