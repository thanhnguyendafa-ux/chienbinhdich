import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const report = readFileSync(new URL('../src/features/report/renderReport.js', import.meta.url), 'utf8');
const questionRegistry = readFileSync(new URL('../src/features/drill/questionTypeRegistry.js', import.meta.url), 'utf8');
const reportCss = readFileSync(new URL('../styles/report-document.css', import.meta.url), 'utf8');
const typographyCss = readFileSync(new URL('../styles/typography.css', import.meta.url), 'utf8');
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

test('submitted reports expose print in a top toolbar while printing stays outside learning evidence', () => {
  const toolbarIndex = report.indexOf('class="report-toolbar shell"');
  const documentIndex = report.indexOf('class="report-document shell');
  assert.ok(toolbarIndex >= 0 && documentIndex > toolbarIndex, 'toolbar should render before the report document');
  assert.match(report, /report-toolbar-actions/);
  assert.match(report, /submitted \? '<button id="print-report-btn"/);
  assert.match(report, /<button id="home-btn"/);
  assert.match(report, /window\.print\(\)/);
  assert.doesNotMatch(sessionMachine, /print-report|window\.print|printedAt/);
});

test('report prioritizes parent-facing assignment results before line-based technical details', () => {
  const heroCall = report.indexOf('renderAssignmentHero({ session, set, summary })');
  const technical = report.indexOf("metricSection('Chi tiết quá trình học'");
  assert.ok(heroCall >= 0 && technical > heroCall);
  assert.match(report, /class="report-key-results"/);
  assert.match(report, /class="report-question-results"/);
  assert.match(report, /Tổng số câu/);
  assert.match(report, /Tổng thời gian/);
  assert.match(report, /metricSection\('Chi tiết quá trình học'/);
  assert.match(report, /metricSection\('Thời gian chi tiết'/);
  assert.match(report, /metricSection\('Dấu hiệu quá trình'/);
  assert.match(report, /class="metric-line"/);
  assert.doesNotMatch(report, /class="report-grid"/);
  assert.match(reportCss, /\.report-key-results\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(reportCss, /\.metric-line\{display:grid;grid-auto-flow:column/);
  assert.match(reportCss, /border-top:1px solid black/);
});

test('timeline is a compact line report rather than colored attempt cards', () => {
  assert.match(reportCss, /\.attempt-row\{display:grid[^}]*border-bottom:1px solid black[^}]*background:white/);
  assert.doesNotMatch(report, /attempt-correct|attempt-wrong/);
  assert.match(report, /SỬA ĐÚNG/);
  assert.match(report, /ĐÚNG/);
  assert.match(report, /SAI/);
});

test('Vietnamese typography layer uses Segoe UI for app and Arial for reports', () => {
  assert.match(typographyCss, /--font-body:"Segoe UI",Arial,sans-serif/);
  assert.match(typographyCss, /--font-display:"Segoe UI",Arial,sans-serif/);
  assert.match(typographyCss, /--font-report:Arial,"Segoe UI",sans-serif/);
  assert.doesNotMatch(typographyCss, /Georgia|Times New Roman|Inter/);
  assert.match(typographyCss, /line-height:1\.16/);
  assert.ok(index.indexOf('/styles/typography.css') > index.indexOf('/styles/session-flow.css'));
  assert.ok(index.indexOf('/styles/report-document.css') > index.indexOf('/styles/typography.css'));
});

test('screen report is strict black and white with no color-token dependency', () => {
  assert.match(reportCss, /\.report-page\{[^}]*background:white[^}]*color:black/);
  assert.match(reportCss, /\.report-document\{[^}]*background:white[^}]*color:black[^}]*box-shadow:none/);
  assert.match(reportCss, /\.report-toolbar \.primary-btn\{background:black;color:white/);
  assert.doesNotMatch(reportCss, /var\(--color-/);
  assert.doesNotMatch(reportCss, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(reportCss, /\b(?:gray|grey|silver|dimgray|lightgray)\b/i);
});

test('report print stylesheet is strict black-white A4 and hides the top toolbar', () => {
  assert.match(index, /styles\/report-print\.css/);
  assert.match(printCss, /@page\{size:A4 portrait;margin:12mm\}/);
  assert.match(printCss, /@media print/);
  assert.match(printCss, /\.report-toolbar\{display:none!important\}/);
  assert.match(printCss, /break-inside:avoid/);
  assert.match(printCss, /font-family:Arial,"Segoe UI",sans-serif!important/);
  assert.doesNotMatch(printCss, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(printCss, /\b(?:gray|grey|silver|dimgray|lightgray)\b/i);
  assert.doesNotMatch(printCss, /var\(--color-/);
});

test('mobile keeps report actions at the top and turns metric rows into scan-friendly lines', () => {
  assert.match(reportCss, /@media \(max-width:640px\)/);
  assert.match(reportCss, /\.report-toolbar-actions\{display:grid;grid-template-columns:1fr 1fr;flex:1\}/);
  assert.match(reportCss, /min-height:46px/);
  assert.match(reportCss, /\.metric-line\{display:block;border-top:0\}/);
  assert.match(reportCss, /\.metric-item\{padding:8px 4px;border-top:1px solid black;border-right:0\}/);
});
