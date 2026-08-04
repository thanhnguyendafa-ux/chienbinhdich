import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const lessonRepository = readFileSync(new URL('../src/repositories/lessonRepository.js', import.meta.url), 'utf8');
const sessionMachine = readFileSync(new URL('../src/core/sessionMachine.js', import.meta.url), 'utf8');
const retryScheduler = readFileSync(new URL('../src/core/retryScheduler.js', import.meta.url), 'utf8');
const drill = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

test('feature screens and lesson data stay lazy-loaded', () => {
  for (const path of ['entry/renderEntry.js', 'library/renderLibrary.js', 'drill/renderDrill.js', 'report/renderReport.js']) {
    assert.match(app, new RegExp(`import\\('./features/${path.replace('.', '\\.')}`));
  }
  assert.match(lessonRepository, /import\('\.\.\/data\/global7-unit1-set1\.js'\)/);
});

test('attempt log remains mastery SSOT rather than storing derived mastery or item states', () => {
  const createSessionBody = sessionMachine.slice(sessionMachine.indexOf('export function createSession'), sessionMachine.indexOf('export function submitAnswer'));
  assert.doesNotMatch(createSessionBody, /mastery\s*:/);
  assert.doesNotMatch(createSessionBody, /itemStates\s*:/);
  assert.match(createSessionBody, /attempts:\s*\[\]/);
});

test('retry timing lives in scheduler domain rather than Drill UI', () => {
  assert.match(retryScheduler, /export const RETRY_GAP = 2/);
  assert.doesNotMatch(drill, /splice\(|eligiblePromptIndex|retryQueue\.push/);
});

test('stable set deep links have a Vercel rewrite to the SPA shell', () => {
  assert.deepEqual(vercel.rewrites, [{ source: '/s/:setId', destination: '/' }]);
});

test('CSS explicitly supports classroom, tablet and iPhone-sized viewports', () => {
  assert.match(css, /min-width:\s*900px[^}]*max-height:\s*620px/s);
  assert.match(css, /min-width:641px[^}]*max-width:900px/s);
  assert.match(css, /max-width:\s*640px/);
});

test('raw hex colors live only inside the design-token root block', () => {
  const rootEnd = css.indexOf('\n}');
  const afterRoot = css.slice(rootEnd + 2);
  assert.doesNotMatch(afterRoot, /#[0-9a-fA-F]{3,8}\b/);
});
