import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const renderSource = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../styles/teaching-feedback.css', import.meta.url), 'utf8');

test('drill renderer mounts reusable theory support and binds toggle controls', () => {
  assert.match(renderSource, /theorySupportViewModel/);
  assert.match(renderSource, /renderTheorySupport/);
  assert.match(renderSource, /data-theory-toggle/);
  assert.match(renderSource, /View theory \/ Xem lý thuyết/);
  assert.match(renderSource, /View theory after submitting \/ Xem lý thuyết sau khi làm câu này/);
});

test('resolved teaching feedback renders per-word answer analysis when present', () => {
  assert.match(renderSource, /answerAnalysis/);
  assert.match(renderSource, /ANSWER ANALYSIS \/ GIẢI THÍCH TỪNG TỪ/);
});

test('theory support has dedicated responsive styling', () => {
  assert.match(cssSource, /\.theory-support/);
  assert.match(cssSource, /\.theory-support-toggle/);
  assert.match(cssSource, /\.answer-analysis/);
});
