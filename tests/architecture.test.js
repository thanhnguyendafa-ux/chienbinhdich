import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const lessonRepository = readFileSync(new URL('../src/repositories/lessonRepository.js', import.meta.url), 'utf8');
const localSessionRepository = readFileSync(new URL('../src/repositories/localSessionRepository.js', import.meta.url), 'utf8');
const sessionMachine = readFileSync(new URL('../src/core/sessionMachine.js', import.meta.url), 'utf8');
const questionTypes = readFileSync(new URL('../src/core/questionTypes.js', import.meta.url), 'utf8');
const retryScheduler = readFileSync(new URL('../src/core/retryScheduler.js', import.meta.url), 'utf8');
const drill = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');
const questionRegistry = readFileSync(new URL('../src/features/drill/questionTypeRegistry.js', import.meta.url), 'utf8');
const masteryProgress = readFileSync(new URL('../src/ui/masteryProgress.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
const masteryCss = readFileSync(new URL('../styles/mastery-progress.css', import.meta.url), 'utf8');
const questionCss = readFileSync(new URL('../styles/question-types.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

test('feature screens and lesson data stay lazy-loaded', () => {
  for (const path of ['entry/renderEntry.js', 'library/renderLibrary.js', 'drill/renderDrill.js', 'report/renderReport.js']) {
    assert.match(app, new RegExp(`import\\('./features/${path.replace('.', '\\.')}`));
  }
  assert.match(lessonRepository, /global7-unit1-set1\.js/);
  assert.match(lessonRepository, /global7-unit1-mixed-demo\.js/);
});

test('attempt log remains mastery SSOT rather than storing derived mastery or item states', () => {
  const createSessionBody = sessionMachine.slice(sessionMachine.indexOf('export function createSession'), sessionMachine.indexOf('export function submitAnswer'));
  assert.doesNotMatch(createSessionBody, /mastery\s*:/);
  assert.doesNotMatch(createSessionBody, /itemStates\s*:/);
  assert.match(createSessionBody, /attempts:\s*\[\]/);
});

test('question-specific correctness is normalized before shared session scoring', () => {
  assert.match(sessionMachine, /evaluateQuestion\(item, submittedResponse\)/);
  assert.doesNotMatch(sessionMachine, /correctChoiceId|correctOrder|true_false/);
  for (const type of ['typing', 'mcq', 'true_false', 'sentence_order']) assert.match(questionTypes, new RegExp(`${type}:`));
});

test('only the first attempt in each exposure can change mastery', () => {
  assert.match(sessionMachine, /masteryDeltaUnits = attemptNumber === 1 \? \(result\.correct \? 1 : -1\) : 0/);
});

test('retry timing lives in scheduler domain rather than question renderers', () => {
  assert.match(retryScheduler, /export const RETRY_GAP = 2/);
  assert.doesNotMatch(drill, /splice\(|eligiblePromptIndex|retryQueue\.push/);
  assert.doesNotMatch(questionRegistry, /eligiblePromptIndex|retryQueue/);
});

test('Question Type Registry owns interactions for Sample A types', () => {
  assert.match(questionRegistry, /typing:\s*\{/);
  assert.match(questionRegistry, /mcq:\s*\{/);
  assert.match(questionRegistry, /true_false:\s*\{/);
  assert.match(questionRegistry, /sentence_order:\s*\{/);
  assert.match(questionRegistry, /data-choice-id/);
  assert.match(questionRegistry, /data-boolean/);
  assert.match(questionRegistry, /data-order-root/);
});

test('mastery progress is CSP-safe, accessible and driven by set threshold', () => {
  assert.match(drill, /renderMasteryProgress/);
  assert.match(drill, /set\.passThreshold/);
  assert.match(masteryProgress, /role=\"progressbar\"/);
  assert.match(masteryProgress, /aria-valuenow/);
  assert.match(masteryProgress, /x1=\"\$\{target\}\"/);
  assert.match(masteryProgress, /width=\"\$\{before\}\"/);
  assert.doesNotMatch(drill, /style=/);
  assert.doesNotMatch(questionRegistry, /style=/);
  assert.doesNotMatch(masteryProgress, /style=/);
});

test('security policy remains strict instead of enabling unsafe inline styles', () => {
  const csp = vercel.headers.flatMap(entry => entry.headers).find(header => header.key === 'Content-Security-Policy')?.value ?? '';
  assert.match(csp, /style-src 'self'/);
  assert.doesNotMatch(csp, /unsafe-inline/);
  assert.match(index, /styles\/mastery-progress\.css/);
  assert.match(index, /styles\/question-types\.css/);
});

test('mastery animation supports gain, loss and reduced-motion users', () => {
  assert.match(masteryProgress, /attributeName', 'width'/);
  assert.match(masteryProgress, /prefers-reduced-motion/);
  assert.match(masteryCss, /mastery-gain-pulse/);
  assert.match(masteryCss, /mastery-loss-pulse/);
  assert.match(masteryCss, /prefers-reduced-motion:reduce/);
});

test('student feedback distinguishes mastery loss, floor and neutral correction attempts', () => {
  assert.match(drill, /Mastery không đổi/);
  assert.match(drill, /Mastery đang ở sàn 0%/);
  assert.match(drill, /delta < 0/);
});

test('session persistence key advances for mixed response evidence', () => {
  assert.match(sessionMachine, /SESSION_SCHEMA_VERSION = 6/);
  assert.match(localSessionRepository, /cbd\.activeSession\.v6/);
  assert.match(localSessionRepository, /cbd\.report\.v6\./);
});

test('stable set deep links have a Vercel rewrite to the SPA shell', () => {
  assert.deepEqual(vercel.rewrites, [{ source: '/s/:setId', destination: '/' }]);
});

test('CSS explicitly protects classroom 1280x529 and iPhone-sized layouts', () => {
  assert.match(css, /min-width:\s*900px[^}]*max-height:\s*620px/s);
  assert.match(masteryCss, /min-width:900px[^}]*max-height:620px/s);
  assert.match(questionCss, /min-width:900px[^}]*max-height:620px/s);
  assert.match(questionCss, /max-width:640px/);
  assert.match(questionCss, /max-height:500px[^}]*orientation:landscape/s);
  assert.match(questionCss, /mcq-grid\{grid-template-columns:repeat\(2/);
  assert.match(questionCss, /@media \(max-width:640px\)[\s\S]*\.mcq-grid\{grid-template-columns:1fr\}/);
});

test('raw hex colors live only inside the global design-token root block', () => {
  const rootEnd = css.indexOf('\n}');
  const afterRoot = css.slice(rootEnd + 2);
  assert.doesNotMatch(afterRoot, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(masteryCss, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(questionCss, /#[0-9a-fA-F]{3,8}\b/);
});
