import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { renderPrintMcq } from '../src/features/admin/print/questions/renderPrintMcq.js';
import { renderPrintTrueFalse } from '../src/features/admin/print/questions/renderPrintTrueFalse.js';
import { renderPrintTyping } from '../src/features/admin/print/questions/renderPrintTyping.js';
import { renderPrintSentenceOrder } from '../src/features/admin/print/questions/renderPrintSentenceOrder.js';
import { renderPrintClassification } from '../src/features/admin/print/questions/renderPrintClassification.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

function questions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

const sampleTheory = Object.freeze({
  theory: 'Read the rule first. / Đọc quy tắc trước.',
  example: 'Example word / Từ ví dụ',
  workedExample: Object.freeze({ label: 'MODEL / MẪU', text: 'Apply the rule. / Áp dụng quy tắc.' })
});

test('student pronunciation print mirrors anytime vs after_submit theory access', async () => {
  const lesson = await loadLessonSet('g7-u1-pronunciation-01');
  const student = buildLessonPrintModel(lesson, { version: 'student' });
  const printed = questions(student);

  for (const question of printed.slice(0, 11)) {
    assert.ok(question.studentTheory?.theory, `${question.id} should print anytime theory`);
    assert.equal('teacher' in question, false, `${question.id} must stay student-safe`);
  }

  for (const question of printed.slice(11)) {
    assert.equal('studentTheory' in question, false, `${question.id} must hide after_submit theory`);
    assert.equal('teacher' in question, false, `${question.id} must stay student-safe`);
    if (question.type === 'classification') {
      assert.ok(question.groups.every(group => group.helper === ''), `${question.id} must hide classification helpers before retrieval`);
    }
  }
});

test('teacher pronunciation print keeps classification helpers and full theory', async () => {
  const lesson = await loadLessonSet('g7-u1-pronunciation-01');
  const teacher = buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' });
  const q12 = questions(teacher).find(question => question.id === 'g7u1-pr-q12');

  assert.ok(q12);
  assert.ok(q12.groups.every(group => group.helper.length > 0));
  assert.ok(q12.teacher?.answer);
  assert.ok(q12.teacher?.reason);
  assert.ok(q12.teacher?.theory);
  assert.equal('studentTheory' in q12, false);
});

test('print follows effective item theory access without a separate PDF setting', async () => {
  const lesson = await loadLessonSet('g7-u1-pronunciation-01');
  const revised = {
    ...lesson,
    version: Number(lesson.version ?? 1) + 100,
    items: lesson.items.map(item => {
      if (item.id === 'g7u1-pr-q01') return { ...item, theorySupport: { access: 'after_submit' } };
      if (item.id === 'g7u1-pr-q12') return { ...item, theorySupport: { access: 'anytime' } };
      return item;
    })
  };

  const student = buildLessonPrintModel(revised, { version: 'student' });
  const q1 = questions(student).find(question => question.id === 'g7u1-pr-q01');
  const q12 = questions(student).find(question => question.id === 'g7u1-pr-q12');

  assert.equal('studentTheory' in q1, false);
  assert.ok(q12.studentTheory?.theory);
  assert.ok(q12.groups.every(group => group.helper.length > 0));
});

test('all five print renderers place the shared student theory box before learner response content', () => {
  const rendered = [
    renderPrintMcq({
      number: 1,
      prompt: 'MCQ prompt',
      studentTheory: sampleTheory,
      choices: [{ label: 'A', text: 'One' }, { label: 'B', text: 'Two' }],
      layout: 'grid-2'
    }),
    renderPrintTrueFalse({ number: 2, prompt: 'TF prompt', studentTheory: sampleTheory }),
    renderPrintTyping({ number: 3, prompt: 'Typing prompt', studentTheory: sampleTheory, lines: 1 }),
    renderPrintSentenceOrder({ number: 4, prompt: 'Order prompt', studentTheory: sampleTheory, tokens: ['A', 'B'], lines: 1 }),
    renderPrintClassification({
      number: 5,
      prompt: 'Classification prompt',
      studentTheory: sampleTheory,
      tokens: ['word'],
      groups: [{ label: 'Group 1', helper: '' }, { label: 'Group 2', helper: '' }]
    })
  ];

  for (const html of rendered) {
    assert.match(html, /data-print-student-theory/);
    assert.match(html, /THEORY \/ LÝ THUYẾT/);
    assert.match(html, /Example \/ Ví dụ:/);
    assert.ok(html.indexOf('data-print-student-theory') < html.indexOf('lesson-print-prompt'));
    assert.doesNotMatch(html, /lesson-print-teacher-answer/);
  }
});

test('student theory print CSS is A4-friendly, monochrome-friendly, and kept with its question', () => {
  const css = readFileSync(new URL('../styles/lesson-print.css', import.meta.url), 'utf8');
  assert.match(css, /\.lesson-print-student-theory\{[^}]*border:1px solid #000[^}]*background:#fff[^}]*font-size:12pt[^}]*break-inside:avoid/s);
  assert.match(css, /\.lesson-print-question\{[^}]*break-inside:avoid/s);
  assert.match(css, /\.lesson-print-student-theory[^}]*break-inside:avoid/s);
});
