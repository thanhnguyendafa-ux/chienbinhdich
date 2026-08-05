import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sessionMachine = readFileSync(new URL('../src/core/sessionMachine.js', import.meta.url), 'utf8');
const retryScheduler = readFileSync(new URL('../src/core/retryScheduler.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const drill = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');
const report = readFileSync(new URL('../src/features/report/renderReport.js', import.meta.url), 'utf8');
const sessionCss = readFileSync(new URL('../styles/session-flow.css', import.meta.url), 'utf8');

test('Session Machine owns qualification while Retry Scheduler only chooses the next prompt', () => {
  assert.match(sessionMachine, /export function qualifySessionIfEligible/);
  assert.match(sessionMachine, /status: 'passed'/);
  assert.match(sessionMachine, /qualifiedAt:/);
  assert.doesNotMatch(retryScheduler, /hasReachedMastery/);
  assert.doesNotMatch(retryScheduler, /status:\s*'passed'/);
});

test('answer submission stops at qualification checkpoint before scheduling another prompt', () => {
  const correctPath = sessionMachine.slice(
    sessionMachine.indexOf('const wasCorrection'),
    sessionMachine.indexOf('return {\n    session: nextSession', sessionMachine.indexOf('const wasCorrection'))
  );
  assert.match(correctPath, /qualifySessionIfEligible\(nextSession, set\)/);
  assert.match(correctPath, /if \(nextSession\.status !== 'passed'\) nextSession = advanceLearningPrompt/);
});

test('Làm tiếp resumes the preserved scheduler state rather than forcing generic review', () => {
  const body = sessionMachine.slice(
    sessionMachine.indexOf('export function continueQualifiedSession'),
    sessionMachine.indexOf('export function abandonSession')
  );
  assert.match(body, /status: 'extended'/);
  assert.match(body, /return advanceLearningPrompt\(extended, set\)/);
  assert.doesNotMatch(body, /beginExtendedPracticePrompt/);
  assert.match(drill, /extendedMode \? '<button class="secondary-btn extended-submit-btn"[^>]*>Nộp bài<\/button>'/);
});

test('persisted active V7 sessions are reconciled before drill UI decides whether to show checkpoint', () => {
  assert.match(app, /const reconciled = qualifySessionIfEligible\(session, lesson\)/);
  assert.match(app, /sessions\.saveActive\(session\)/);
  assert.ok(app.indexOf('qualifySessionIfEligible(session, lesson)') < app.indexOf("if (session.status === 'passed')"));
});

test('submitted report exposes how much of the main sequence was completed at submission', () => {
  assert.match(report, /\['Chuỗi chính', `\$\{metrics\.completedMainItems\}\/\$\{metrics\.total\}`\]/);
  assert.match(report, /Chuỗi chính \$\{metrics\.completedMainItems\}\/\$\{metrics\.total\}/);
});

test('qualification checkpoint stays reachable on classroom and iPhone layouts', () => {
  assert.match(sessionCss, /\.qualification-actions\{display:grid;grid-template-columns:1fr 1fr/);
  assert.match(sessionCss, /@media \(max-width:640px\)[\s\S]*\.qualification-actions\{grid-template-columns:1fr\}/);
  assert.match(sessionCss, /min-width:900px[^}]*max-height:620px/);
});
