import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const renderSource = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');
const theoryRendererSource = readFileSync(new URL('../src/features/drill/theorySupportRenderer.js', import.meta.url), 'utf8');
const analysisRendererSource = readFileSync(new URL('../src/features/drill/answerAnalysisRenderer.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../styles/theory-support.css', import.meta.url), 'utf8');

test('drill renderer mounts reusable theory support and binds toggle controls', () => {
  assert.match(renderSource, /renderTheorySupport/);
  assert.match(renderSource, /bindTheorySupport/);
  assert.match(theoryRendererSource, /theorySupportViewModel/);
  assert.match(theoryRendererSource, /data-theory-toggle/);
  assert.match(theoryRendererSource, /View theory \/ Xem lý thuyết/);
  assert.match(theoryRendererSource, /View theory after submitting \/ Xem lý thuyết sau khi làm câu này/);
});

test('resolved teaching feedback renders per-word answer analysis when present', () => {
  assert.match(renderSource, /renderAnswerAnalysis/);
  assert.match(analysisRendererSource, /answerAnalysis/);
  assert.match(analysisRendererSource, /ANSWER ANALYSIS \/ GIẢI THÍCH TỪNG TỪ/);
});

test('theory support has dedicated responsive styling', () => {
  assert.match(cssSource, /\.theory-support/);
  assert.match(cssSource, /\.theory-support-toggle/);
  assert.match(cssSource, /\.answer-analysis/);
});
