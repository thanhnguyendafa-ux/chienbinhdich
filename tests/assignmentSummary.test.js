import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deriveAssignmentSummary } from '../src/core/assignmentSummary.js';

const set = {
  passThreshold: 80,
  items: Array.from({ length: 17 }, (_, index) => ({ id: `q${index + 1}` }))
};

function mainAttempt(itemId, correct, masteryDeltaUnits, submittedAt) {
  return {
    id: `${itemId}-${submittedAt}`,
    itemId,
    promptKind: 'main',
    attemptNumber: 1,
    correct,
    masteryDeltaUnits,
    submittedAt
  };
}

test('summary reports total items and first-try correct/wrong counts without inflating retry attempts', () => {
  const attempts = [
    ...Array.from({ length: 14 }, (_, index) => mainAttempt(`q${index + 1}`, true, 1, 10_000 + index)),
    mainAttempt('q15', false, -1, 20_015),
    mainAttempt('q16', false, -1, 20_016),
    mainAttempt('q17', false, -1, 20_017),
    { id: 'q15-correction', itemId: 'q15', promptKind: 'main', attemptNumber: 2, correct: true, masteryDeltaUnits: 0, submittedAt: 21_015 },
    { id: 'q16-correction', itemId: 'q16', promptKind: 'main', attemptNumber: 2, correct: true, masteryDeltaUnits: 0, submittedAt: 21_016 },
    { id: 'q17-correction', itemId: 'q17', promptKind: 'main', attemptNumber: 2, correct: true, masteryDeltaUnits: 0, submittedAt: 21_017 },
    { id: 'q15-retry', itemId: 'q15', promptKind: 'retry', attemptNumber: 1, correct: true, masteryDeltaUnits: 1, submittedAt: 30_015 },
    { id: 'q16-retry', itemId: 'q16', promptKind: 'retry', attemptNumber: 1, correct: true, masteryDeltaUnits: 1, submittedAt: 30_016 },
    { id: 'q17-retry', itemId: 'q17', promptKind: 'retry', attemptNumber: 1, correct: true, masteryDeltaUnits: 1, submittedAt: 30_017 }
  ];
  const session = { status: 'submitted', startedAt: 1_000, completedAt: 761_000, attempts };

  const summary = deriveAssignmentSummary(session, set);
  assert.equal(summary.status, 'passed');
  assert.equal(summary.totalItems, 17);
  assert.equal(summary.attemptedItems, 17);
  assert.equal(summary.correctFirstTry, 14);
  assert.equal(summary.wrongFirstTry, 3);
  assert.equal(summary.unansweredItems, 0);
  assert.equal(summary.mastery, 82.35);
  assert.equal(summary.durationMs, 760_000);
});

test('abandoned summary keeps unanswered items separate from wrong answers', () => {
  const attempts = [
    ...Array.from({ length: 6 }, (_, index) => mainAttempt(`q${index + 1}`, true, 1, 10_000 + index)),
    mainAttempt('q7', false, -1, 20_007),
    mainAttempt('q8', false, -1, 20_008),
    mainAttempt('q9', false, -1, 20_009)
  ];
  const session = { status: 'abandoned', startedAt: 2_000, completedAt: 362_000, attempts };

  const summary = deriveAssignmentSummary(session, set);
  assert.equal(summary.status, 'abandoned');
  assert.equal(summary.totalItems, 17);
  assert.equal(summary.attemptedItems, 9);
  assert.equal(summary.correctFirstTry, 6);
  assert.equal(summary.wrongFirstTry, 3);
  assert.equal(summary.unansweredItems, 8);
  assert.equal(summary.durationMs, 360_000);
});

test('report layout puts the assignment/result hero before technical process metrics and timeline', () => {
  const source = readFileSync(new URL('../src/features/report/renderReport.js', import.meta.url), 'utf8');
  const hero = source.indexOf('renderAssignmentHero({ session, set, summary })');
  const technical = source.indexOf("metricSection('Chi tiết quá trình học'");
  const timeline = source.indexOf('timeline-section');
  assert.ok(hero >= 0);
  assert.ok(technical > hero);
  assert.ok(timeline > technical);
  assert.match(source, /Tổng số câu/);
  assert.match(source, /Đúng/);
  assert.match(source, /Sai/);
  assert.match(source, /Tổng thời gian/);
  assert.match(source, /PASS ✓/);
  assert.match(source, /BỎ CUỘC/);
});

test('print stylesheet keeps the parent-facing result summary together on the first report area', () => {
  const printCss = readFileSync(new URL('../styles/report-print.css', import.meta.url), 'utf8');
  assert.match(printCss, /\.report-assignment-hero/);
  assert.match(printCss, /\.report-key-results/);
  assert.match(printCss, /\.report-question-results/);
  assert.match(printCss, /break-inside:avoid/);
});
