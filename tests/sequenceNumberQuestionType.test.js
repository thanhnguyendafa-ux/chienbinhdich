import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SUPPORTED_QUESTION_TYPES,
  evaluateQuestion,
  expectedResponseDisplay,
  sequenceNumberAnswerMap
} from '../src/core/questionTypes.js';
import { validateSet } from '../src/data/contentValidator.js';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { renderPrintQuestion } from '../src/features/admin/print/printQuestionRegistry.js';

const makeItem = () => ({
  id: 'sequence-fixture',
  type: 'sequence_number',
  prompt: 'Đánh số các dòng theo đúng thứ tự.',
  lines: [
    { id: 'line-b', text: 'Second line.' },
    { id: 'line-a', text: 'First line.', lockedPosition: 1 },
    { id: 'line-c', text: 'Third line.' }
  ],
  correctOrder: ['line-a', 'line-b', 'line-c']
});

const makeSet = () => ({
  id: 'sequence-set',
  version: 1,
  completionPolicy: 'all-items',
  items: [makeItem()]
});

test('sequence_number is a native question type with canonical line-to-position mapping', () => {
  const item = makeItem();
  assert.equal(SUPPORTED_QUESTION_TYPES.includes('sequence_number'), true);
  assert.deepEqual(sequenceNumberAnswerMap(item), { 'line-a': 1, 'line-b': 2, 'line-c': 3 });
  assert.equal(evaluateQuestion(item, { 'line-a': 1, 'line-b': 2, 'line-c': 3 }).correct, true);
  assert.equal(evaluateQuestion(item, { 'line-a': 1, 'line-b': 3, 'line-c': 2 }).correct, false);
  assert.equal(evaluateQuestion(item, { 'line-a': 1, 'line-b': 2 }).correct, false);
  assert.equal(evaluateQuestion(item, { 'line-a': 1, 'line-b': 2, 'line-c': 2 }).correct, false);
  assert.match(expectedResponseDisplay(item), /1\. First line\./);
  assert.match(expectedResponseDisplay(item), /2\. Second line\./);
});

test('sequence_number validator accepts valid content and rejects broken identity/order/locks', () => {
  assert.deepEqual(validateSet(makeSet()), []);

  const duplicate = makeSet();
  duplicate.items[0].lines[2].id = 'line-b';
  assert.ok(validateSet(duplicate).some(error => error.includes('trùng id')));

  const wrongLock = makeSet();
  wrongLock.items[0].lines[1].lockedPosition = 2;
  assert.ok(validateSet(wrongLock).some(error => error.includes('lockedPosition phải khớp')));

  const missing = makeSet();
  missing.items[0].correctOrder = ['line-a', 'line-b'];
  assert.ok(validateSet(missing).some(error => error.includes('correctOrder')));
});

test('Session V7 stores sequence_number object responses without a schema change', () => {
  const set = makeSet();
  const session = createSession({ studentName: 'Admin Demo', set, now: 1000 });
  const response = { 'line-a': 1, 'line-b': 2, 'line-c': 3 };
  const result = submitAnswer({ session, set, response, attemptMeta: { inputMethod: 'tap', startedAt: 1000 }, now: 1100 });
  const attempt = result.session.attempts[0];
  assert.equal(attempt.questionType, 'sequence_number');
  assert.deepEqual(attempt.submittedResponse, response);
  assert.equal(attempt.correct, true);
  assert.equal(attempt.inputMethod, 'tap');
});

test('learner renderer keeps lines fixed and exposes number bank, slots, tap and drag/drop hooks', async () => {
  const html = renderQuestionInteraction(makeItem());
  assert.match(html, /data-sequence-bank/);
  assert.match(html, /data-sequence-number="2"/);
  assert.doesNotMatch(html, /data-sequence-number="1"/);
  assert.match(html, /data-sequence-slot="line-a"/);
  assert.match(html, /data-sequence-locked="1"/);
  assert.ok(html.indexOf('Second line.') < html.indexOf('First line.'));

  const source = await readFile(new URL('../src/features/drill/questionTypeRegistry.js', import.meta.url), 'utf8');
  assert.match(source, /dragstart/);
  assert.match(source, /dragover/);
  assert.match(source, /drop/);
  assert.match(source, /activeNumber/);
  assert.match(source, /meta\(attemptStartedAt, 'tap', false\)/);

  const css = await readFile(new URL('../styles/question-types.css', import.meta.url), 'utf8');
  assert.match(css, /\.sequence-number-line/);
  assert.match(css, /grid-template-columns:52px minmax\(0,1fr\)/);
});

test('sequence_number print keeps student answers hidden while Teacher Full gets canonical numbers', () => {
  const lesson = {
    ...makeSet(),
    course: 'Test course',
    unit: 'Test unit',
    title: 'Sequence test'
  };
  const studentModel = buildLessonPrintModel(lesson, { version: 'student' });
  const studentQuestion = studentModel.sections[0].blocks[0].questions[0];
  assert.equal(studentQuestion.type, 'sequence_number');
  assert.equal('teacher' in studentQuestion, false);
  assert.equal('position' in studentQuestion.sequenceLines[0], false);
  const studentHtml = renderPrintQuestion(studentQuestion);
  assert.match(studentHtml, /____/);
  assert.match(studentHtml, />1<\/strong><span>First line\./);
  assert.doesNotMatch(studentHtml, />2<\/strong><span>Second line\./);

  const teacherModel = buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' });
  const teacherQuestion = teacherModel.sections[0].blocks[0].questions[0];
  assert.deepEqual(teacherQuestion.teacher.sequencePositions, [
    { id: 'line-b', position: 2 },
    { id: 'line-a', position: 1 },
    { id: 'line-c', position: 3 }
  ]);
  const teacherHtml = renderPrintQuestion(teacherQuestion);
  assert.match(teacherHtml, />2<\/strong><span>Second line\./);
  assert.match(teacherHtml, />1<\/strong><span>First line\./);
});

test('Admin source exposes sequence_number authoring without JSON-only editing and preserves True/False selection semantics', async () => {
  const editor = await readFile(new URL('../src/features/admin/content/universalContentEditor.js', import.meta.url), 'utf8');
  assert.match(editor, /sequence_number/);
  assert.match(editor, /data-sequence-line-text/);
  assert.match(editor, /data-sequence-correct-position/);
  assert.match(editor, /data-sequence-locked/);
  assert.match(editor, /Sắp xếp thứ tự \/ Đánh số/);
  assert.match(editor, /item\.answer === false \? 'selected' : ''/);
});
