import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const theme = readFileSync(new URL('../styles/academic-theme.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Academic Paper theme is loaded after interaction styles and before report print styles', () => {
  const themeIndex = index.indexOf('/styles/academic-theme.css');
  assert.ok(themeIndex > index.indexOf('/styles/typography.css'));
  assert.ok(themeIndex < index.indexOf('/styles/report-document.css'));
  assert.match(index, /name="theme-color" content="#315B7D"/);
});

test('Academic Paper palette is centralized as semantic CSS variables without raw hex in the theme layer', () => {
  for (const token of [
    '--color-canvas', '--color-paper', '--color-ink', '--color-muted', '--color-border',
    '--color-brand', '--color-success', '--color-danger', '--color-warning', '--color-focus'
  ]) {
    assert.match(theme, new RegExp(`${token}:`));
  }
  assert.doesNotMatch(theme, /#[0-9a-f]{3,8}/i);
});

test('student questions prioritize vertical reading while compact classroom screens retain two columns', () => {
  assert.match(theme, /\.prompt-card h1,.mixed-prompt-block h1\{[^}]*font-family:var\(--font-body\)/);
  assert.match(theme, /\.mcq-grid\{grid-template-columns:1fr\}/);
  assert.match(theme, /@media \(min-width:900px\) and \(max-height:620px\)[\s\S]*\.mcq-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.match(theme, /\.choice-btn strong\{font-size:18px/);
});

test('true-false starts neutral and semantic colors are reserved for feedback and mastery target', () => {
  assert.match(theme, /\.tf-btn\{background:var\(--color-paper\);color:var\(--color-ink\)\}/);
  assert.match(theme, /\.error-feedback\{[^}]*border-left:4px solid var\(--color-danger\)/);
  assert.match(theme, /\.reveal-feedback\{[^}]*border-left:4px solid var\(--color-warning\)/);
  assert.match(theme, /\.mastery-progress-target\{stroke:var\(--color-warning\)\}/);
});

test('Vietnamese teaching feedback remains paper-like and readable instead of becoming a saturated success panel', () => {
  assert.match(theme, /\.teaching-feedback\{[^}]*background:var\(--color-paper-strong\)/);
  assert.match(theme, /\.teaching-copy p,.question-context-row p\{font-size:15px;color:var\(--color-ink\);line-height:1\.6\}/);
  assert.doesNotMatch(theme, /\.teaching-feedback\{[^}]*var\(--color-success-soft\)/);
});
