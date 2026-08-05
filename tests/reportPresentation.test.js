import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Vietnamese-safe typography overrides legacy display fonts across the app', async () => {
  const [index, typography] = await Promise.all([
    read('index.html'),
    read('styles/typography.css')
  ]);
  assert.match(typography, /--font-ui:"Segoe UI",Arial,sans-serif/);
  assert.match(typography, /--font-report:Arial,"Segoe UI",sans-serif/);
  assert.match(typography, /h1,h2[^\{]*\{font-family:var\(--font-ui\)/);
  assert.match(typography, /line-height:1\.18;letter-spacing:0/);
  assert.ok(index.indexOf('/styles/typography.css') > index.indexOf('/styles/session-flow.css'));
  assert.ok(index.indexOf('/styles/report-document.css') > index.indexOf('/styles/typography.css'));
});

test('report renderer keeps screen controls above a print-ready document', async () => {
  const source = await read('src/features/report/renderReport.js');
  const toolbarIndex = source.indexOf('class="report-toolbar shell"');
  const documentIndex = source.indexOf('class="report-document shell"');
  assert.ok(toolbarIndex >= 0);
  assert.ok(documentIndex > toolbarIndex);
  assert.ok(source.indexOf('id="print-report-btn"') < documentIndex);
  assert.ok(source.indexOf('id="home-btn"') < documentIndex);
  assert.doesNotMatch(source, /report-grid/);
  assert.match(source, /metric-section/);
  assert.match(source, /metric-line/);
  assert.match(source, /report-document-footer/);
  assert.match(source, /window\.print\(\)/);
});

test('screen report is line-based and strict black-white without semantic app colors', async () => {
  const css = await read('styles/report-document.css');
  assert.match(css, /\.metric-line\{display:grid/);
  assert.match(css, /border-bottom:1px solid black/);
  assert.match(css, /\.attempt-row\{display:block/);
  assert.match(css, /\.report-toolbar\{position:sticky/);
  assert.match(css, /background:white/);
  assert.match(css, /color:black/);
  assert.doesNotMatch(css, /var\(--color-(?:brand|success|danger|accent|warning|canvas|paper|muted|border)/);
  assert.doesNotMatch(css, /(?:silver|lightgray|dimgray|gray)/i);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});

test('print report is A4 portrait, hides toolbar, and remains strict black-white', async () => {
  const css = await read('styles/report-print.css');
  assert.match(css, /@page\{size:A4 portrait;margin:12mm\}/);
  assert.match(css, /\.report-toolbar\{display:none!important\}/);
  assert.match(css, /font-family:Arial,"Segoe UI",sans-serif/);
  assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(css, /var\(--color-/);
  assert.doesNotMatch(css, /(?:silver|lightgray|dimgray|gray)/i);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}/i);
});

test('mobile report keeps top actions touch-friendly while metrics stay line-based', async () => {
  const css = await read('styles/report-document.css');
  assert.match(css, /@media \(max-width:640px\)/);
  assert.match(css, /\.report-actions\{display:grid;grid-template-columns:1fr;width:100%\}/);
  assert.match(css, /\.report-actions button\{width:100%;min-height:48px\}/);
  assert.match(css, /\.metric-line\{grid-template-columns:1fr\}/);
});
