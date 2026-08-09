import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const layoutCss = readFileSync(new URL('../styles/stimulus-reading-layout.css', import.meta.url), 'utf8');
const drillSource = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');

test('stimulus desktop stylesheet loads after the academic theme', () => {
  const academicIndex = indexHtml.indexOf('/styles/academic-theme.css');
  const stimulusIndex = indexHtml.indexOf('/styles/stimulus-reading-layout.css');
  const reportIndex = indexHtml.indexOf('/styles/report-document.css');

  assert.ok(academicIndex >= 0);
  assert.ok(stimulusIndex > academicIndex);
  assert.ok(reportIndex > stimulusIndex);
});

test('stimulus reading split layout is screen-only and applies to wide MCQ cards at any normal laptop height', () => {
  assert.match(layoutCss, /@media screen and \(min-width:1100px\)\{/);
  assert.doesNotMatch(layoutCss, /@media screen and \(min-width:1100px\) and \(min-height:/);
  assert.doesNotMatch(layoutCss, /min-height:650px/);
  assert.match(layoutCss, /\.question-card\.type-mcq:not\(\.has-reading-passage\):has\(\.question-interaction>\.reading-passage\)/);
  assert.match(layoutCss, /grid-template-columns:minmax\(0,58fr\) minmax\(360px,42fr\)/);
  assert.match(layoutCss, /\.reading-choice-grid\{[\s\S]*?grid-template-columns:1fr/);
  assert.match(layoutCss, /font-size:18px/);
  assert.match(layoutCss, /line-height:1\.68/);
  assert.doesNotMatch(layoutCss, /@media\s+print/);
  assert.doesNotMatch(layoutCss, /typing-question|true-false-grid|sentence-order|classification/);
});

test('very short wide screens keep a compact stimulus split without reintroducing the 650px gate', () => {
  assert.match(layoutCss, /@media screen and \(min-width:1100px\) and \(max-height:500px\)/);
  assert.match(layoutCss, /min-height:0/);
  assert.match(layoutCss, /font-size:15px/);
});

test('diagnostic Reading remains excluded because has-reading-passage is passageId-only', () => {
  assert.match(drillSource, /item\.passageId \? 'has-reading-passage' : ''/);
  assert.doesNotMatch(drillSource, /item\.stimulus \? 'has-reading-passage'/);
});
