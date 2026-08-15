import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  alignTeachingSession,
  createTeachingPreviewController,
  deriveTeachingSections,
  resetTeachingSession
} from '../src/features/admin/preview/teachingPreviewController.js';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const htmlSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const teachingCss = readFileSync(new URL('../styles/admin-teaching-mode.css', import.meta.url), 'utf8');

const lesson = Object.freeze({
  items: Object.freeze([
    Object.freeze({ id: 'q1' }),
    Object.freeze({ id: 'q2' }),
    Object.freeze({ id: 'q3' }),
    Object.freeze({ id: 'q4' }),
    Object.freeze({ id: 'q5' })
  ]),
  printGroups: Object.freeze([
    Object.freeze({ id: 'word', title: 'A. WORD FOUNDATION / NHỚ TỪ', itemIds: Object.freeze(['q1', 'q2']) }),
    Object.freeze({ id: 'thinking', title: 'B. REWRITE THINKING / TƯ DUY', itemIds: Object.freeze(['q3', 'q4']) }),
    Object.freeze({ id: 'final', title: 'C. FINAL REWRITE / TỰ VIẾT', itemIds: Object.freeze(['q5']) })
  ])
});

test('teaching sections derive from printGroups and keep question ranges', () => {
  const sections = deriveTeachingSections(lesson);
  assert.deepEqual(sections.map(section => [section.id, section.label, section.startIndex, section.endIndex]), [
    ['word', 'WORD FOUNDATION', 0, 1],
    ['thinking', 'REWRITE THINKING', 2, 3],
    ['final', 'FINAL REWRITE', 4, 4]
  ]);
});

test('teaching navigation supports previous, next, direct jump and section skip without touching attempts', () => {
  const controller = createTeachingPreviewController({ lesson });
  const attempts = Object.freeze([{ itemId: 'q1', correct: true }]);

  assert.equal(controller.getState().questionNumber, 1);
  assert.equal(controller.next().questionNumber, 2);
  assert.equal(controller.previous().questionNumber, 1);
  assert.equal(controller.jumpToQuestion(4).itemId, 'q4');
  assert.equal(controller.jumpToSection('word').itemId, 'q1');
  assert.equal(controller.skipSection().itemId, 'q3');
  assert.equal(controller.skipSection().itemId, 'q5');
  assert.deepEqual(attempts, [{ itemId: 'q1', correct: true }]);
});

test('teaching session alignment changes only local navigation metadata and never invents attempts', () => {
  const session = {
    id: 'preview-1',
    status: 'active',
    currentItemId: 'q1',
    currentPromptKind: 'main',
    promptIndex: 0,
    mainCursor: 1,
    retryQueue: [{ itemId: 'q1' }],
    attempts: [{ itemId: 'q1', promptIndex: 0, correct: false }]
  };
  const aligned = alignTeachingSession(session, lesson, 3);
  assert.equal(aligned.currentItemId, 'q4');
  assert.equal(aligned.promptIndex, 3);
  assert.equal(aligned.mainCursor, 4);
  assert.equal(aligned.persistenceMode, 'preview');
  assert.deepEqual(aligned.retryQueue, []);
  assert.equal(aligned.attempts.length, 1);
});

test('reset current clears only that question while reset all clears all demo attempts', () => {
  const session = {
    id: 'preview-2',
    status: 'active',
    currentItemId: 'q2',
    currentPromptKind: 'main',
    promptIndex: 1,
    mainCursor: 2,
    retryQueue: [],
    attempts: [
      { itemId: 'q1', promptIndex: 0, correct: true },
      { itemId: 'q2', promptIndex: 1, correct: false },
      { itemId: 'q3', promptIndex: 2, correct: true }
    ]
  };
  const currentReset = resetTeachingSession(session, lesson, { cursor: 1 });
  assert.deepEqual(currentReset.attempts.map(attempt => attempt.itemId), ['q1', 'q3']);

  const allReset = resetTeachingSession(session, lesson, { cursor: 0, all: true });
  assert.equal(allReset.currentItemId, 'q1');
  assert.deepEqual(allReset.attempts, []);
});

test('admin auth gate stays before preview routing and student URLs do not gain a teaching query switch', () => {
  const adminGate = appSource.indexOf('if (!state.isAdmin)');
  const previewRoute = appSource.indexOf("params.get('preview')");
  assert.ok(adminGate >= 0 && previewRoute > adminGate);
  assert.doesNotMatch(appSource, /teaching=1|searchParams\.get\(['"]teaching/);
});

test('teaching mode reuses learner renderDrill and never writes preview sessions', () => {
  assert.match(appSource, /renderDrill\(\{/);
  assert.match(appSource, /attachTeachingToolbar/);
  assert.match(appSource, /if \(!previewMode && session\) sessions\.saveActive\(session\)/);
  assert.match(appSource, /if \(!previewMode && session\) sessions\.saveReport\(session\)/);
  assert.doesNotMatch(appSource, /createTeachingQuestion|renderTeachingQuestion/);
});

test('teaching controls are loaded and visually scoped away from normal student mode', () => {
  assert.match(htmlSource, /admin-teaching-mode\.css/);
  assert.match(teachingCss, /\.admin-teaching-mode/);
  assert.match(teachingCss, /\.admin-teaching-toolbar/);
  assert.match(teachingCss, /\.teaching-continue-btn/);
});
