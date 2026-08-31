import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const renderer = readFileSync(new URL('../src/features/assess/renderAssess.js', import.meta.url), 'utf8');
const receipt = readFileSync(new URL('../src/features/assess/renderAssessReceipt.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/assess-app.js', import.meta.url), 'utf8');

test('Assess learner UI has neutral progress and no Mastery/PASS/answer-result rendering', () => {
  assert.match(renderer, /không hiện đúng sai hoặc đáp án/);
  assert.doesNotMatch(renderer, /renderMasteryProgress|masteryEngine|retryScheduler|theorySupport/);
  assert.doesNotMatch(renderer, /\bPASS\b|\bFAIL\b/);
  assert.doesNotMatch(app, /deriveAssessSummary|expectedResponseDisplay|evaluateQuestion/);
});

test('Assess receipt explicitly withholds score and answer', () => {
  assert.match(receipt, /ĐÃ NỘP BÀI/);
  assert.match(receipt, /Điểm và đáp án không hiển thị trong chế độ Assess/);
  assert.doesNotMatch(receipt, /percent|correctCount|wrongCount/);
});
