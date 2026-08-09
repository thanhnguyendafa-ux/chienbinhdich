import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { renderPaper } from '../src/features/admin/print/renderLessonPrint.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const inspectorSource = readFileSync(new URL('../src/features/admin/inspector/renderLessonInspector.js', import.meta.url), 'utf8');

test('Print PDF route lives inside authenticated Admin orchestration and Inspector exposes the action', () => {
  const showAdmin = appSource.match(/async function showAdmin\(\)[\s\S]*?\n}\n\nasync function showAdminDashboard/)?.[0] ?? '';
  assert.match(showAdmin, /getAdminState\(\)/);
  assert.match(showAdmin, /if \(!state\.isAdmin\)/);
  assert.match(showAdmin, /params\.get\('print'\)/);
  assert.match(appSource, /async function showAdminLessonPrint/);
  assert.match(appSource, /loadLessonSet\(setId\)/);
  assert.match(inspectorSource, /In \/ PDF/);
  assert.match(inspectorSource, /onPrint/);
});

test('Student paper has no teacher answer blocks while Teacher paper places answers inline below questions', async () => {
  const lesson = await loadLessonSet('g5-u2-stress-vocab-01');
  const studentHtml = renderPaper(buildLessonPrintModel(lesson, { version: 'student' }));
  const teacherHtml = renderPaper(buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'compact' }));

  assert.doesNotMatch(studentHtml, /BẢN GIÁO VIÊN|lesson-print-teacher-answer|✓/);
  assert.match(teacherHtml, /BẢN GIÁO VIÊN/);
  assert.match(teacherHtml, /lesson-print-teacher-answer/);
  assert.match(teacherHtml, /✓/);
});

test('print feature does not introduce Firebase, Session, Mastery, or PDF-library coupling', () => {
  const modelSource = readFileSync(new URL('../src/features/admin/print/lessonPrintModel.js', import.meta.url), 'utf8');
  const screenSource = readFileSync(new URL('../src/features/admin/print/renderLessonPrint.js', import.meta.url), 'utf8');
  const combined = `${modelSource}\n${screenSource}`;
  assert.doesNotMatch(combined, /firebase|firestore|sessionMachine|masteryPolicy|lessonSettings|jsPDF|pdfkit|puppeteer/i);
  assert.match(screenSource, /window\.print\(\)/);
});
