import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const report = readFileSync(new URL('../src/features/report/renderReport.js', import.meta.url), 'utf8');
const questionRegistry = readFileSync(new URL('../src/features/drill/questionTypeRegistry.js', import.meta.url), 'utf8');
const printCss = readFileSync(new URL('../styles/report-print.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sessionMachine = readFileSync(new URL('../src/core/sessionMachine.js', import.meta.url), 'utf8');

test('true-false renderer uses deterministic per-exposure presentation order', () => {
  const body = questionRegistry.slice(
    questionRegistry.indexOf('function renderTrueFalse'),
    questionRegistry.indexOf('function bindTrueFalse')
  );
  assert.match(body, /exposureKey/);
  assert.match(body, /orderForExposure/);
  assert.match(body, /:true_false/);
  assert.match(body, /data-boolean=\"\$\{option\.value\}\"/);
  assert.doesNotMatch(body, /data-boolean=\"true\"[\s\S]*data-boolean=\"false\"/);
});

test('submitted reports expose print while printing stays outside learning evidence', () => {
  assert.match(report, /submitted \? '<button id=\"print-report-btn\"/);
  assert.match(report, /window\.print\(\)/);
  assert.doesNotMatch(sessionMachine, /print-report|window\.print|printedAt/);
});

test('report print stylesheet is linked and produces a clean A4 layout', () => {
  assert.match(index, /styles\/report-print\.css/);
  assert.match(printCss, /@page\{size:A4 portrait;margin:12mm\}/);
  assert.match(printCss, /@media print/);
  assert.match(printCss, /\.report-actions\{display:none!important\}/);
  assert.match(printCss, /break-inside:avoid/);
  assert.match(printCss, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test('mobile report actions stack with a large print target before invoking native print', () => {
  assert.match(printCss, /@media screen and \(max-width:640px\)/);
  assert.match(printCss, /\.report-actions\{display:grid;grid-template-columns:1fr;width:100%\}/);
  assert.match(printCss, /min-height:48px/);
  assert.match(printCss, /\.print-report-btn\{order:-1\}/);
});

test('print stylesheet does not introduce raw hex colors outside global design tokens', () => {
  assert.doesNotMatch(printCss, /#[0-9a-fA-F]{3,8}\b/);
});
