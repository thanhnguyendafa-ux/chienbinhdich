import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';
import { validateSet } from '../src/data/contentValidator.js';

function questions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

function mcq(id) {
  return { id, type: 'mcq', prompt: 'Choose', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'a' };
}

test('student print model supports all five question types without answer metadata', async () => {
  const [mixed, typing, writing, unit2] = await Promise.all([
    loadLessonSet('g7-u1-mixed-demo'),
    loadLessonSet('g7-u1-s1'),
    loadLessonSet('g5-u1-writing-01'),
    loadLessonSet('g5-u2-stress-vocab-01')
  ]);
  const models = [mixed, typing, writing, unit2].map(lesson => buildLessonPrintModel(lesson, { version: 'student' }));
  const types = new Set(models.flatMap(model => questions(model).map(question => question.type)));
  assert.deepEqual([...types].sort(), ['classification', 'mcq', 'sentence_order', 'true_false', 'typing']);

  const serialized = JSON.stringify(models);
  for (const forbidden of ['correctChoiceId', 'correctGroupId', 'teachingFeedback', 'diagnostic', '"teacher"']) {
    assert.equal(serialized.includes(forbidden), false, `student print leaked ${forbidden}`);
  }
});

test('MCQ Student and Teacher use the same deterministic choice order and teacher key follows printed labels', async () => {
  const lesson = await loadLessonSet('g5-u2-stress-vocab-01');
  const student = buildLessonPrintModel(lesson, { version: 'student' });
  const teacher = buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'compact' });
  const studentQ1 = questions(student).find(question => question.id === 'g5u2-sv-q01');
  const teacherQ1 = questions(teacher).find(question => question.id === 'g5u2-sv-q01');

  assert.deepEqual(studentQ1.choices, teacherQ1.choices);
  const printedCorrect = teacherQ1.choices.find(choice => choice.text === 'sixteen');
  assert.equal(teacherQ1.teacher.answer, `${printedCorrect.label}. sixteen`);
});

test('Sentence Order and Classification print pools are deterministic and identical across Student and Teacher', async () => {
  const [writing, unit2] = await Promise.all([
    loadLessonSet('g5-u1-writing-01'),
    loadLessonSet('g5-u2-stress-vocab-01')
  ]);
  const writingStudent = buildLessonPrintModel(writing, { version: 'student' });
  const writingTeacher = buildLessonPrintModel(writing, { version: 'teacher' });
  const sourceWritingQ5 = writing.items.find(item => item.id === 'g5u1-writing-q05');
  const studentWritingQ5 = questions(writingStudent).find(question => question.id === sourceWritingQ5.id);
  const teacherWritingQ5 = questions(writingTeacher).find(question => question.id === sourceWritingQ5.id);
  assert.deepEqual(studentWritingQ5.tokens, teacherWritingQ5.tokens);
  assert.notDeepEqual(studentWritingQ5.tokens, sourceWritingQ5.tokens);
  assert.equal(teacherWritingQ5.teacher.answer, "I'm in Class 5A.");
  assert.ok(teacherWritingQ5.teacher.alternatives.includes('I am in Class 5A.'));

  const studentUnit2 = buildLessonPrintModel(unit2, { version: 'student' });
  const teacherUnit2 = buildLessonPrintModel(unit2, { version: 'teacher' });
  const studentClassify = questions(studentUnit2).find(question => question.id === 'g5u2-sv-q04');
  const teacherClassify = questions(teacherUnit2).find(question => question.id === 'g5u2-sv-q04');
  assert.deepEqual(studentClassify.tokens, teacherClassify.tokens);
  assert.equal('teacher' in studentClassify, false);
  assert.deepEqual(teacherClassify.teacher.groups.find(group => group.label === 'STRESS 1').values, ['thirty', 'forty', 'eighty']);
});

test('printGroups require exact coverage and preserve source question order', () => {
  const q1 = mcq('q1');
  const q2 = mcq('q2');
  const valid = {
    id: 'print-groups',
    items: [q1, q2],
    printGroups: [
      { id: 'a', title: 'A. FIRST', itemIds: ['q1'] },
      { id: 'b', title: 'B. SECOND', itemIds: ['q2'] }
    ]
  };
  assert.deepEqual(validateSet(valid), []);

  const missing = { ...valid, printGroups: [{ id: 'a', title: 'A. TEST', itemIds: ['missing'] }] };
  const missingErrors = validateSet(missing);
  assert.ok(missingErrors.some(error => error.includes('không tồn tại')));
  assert.ok(missingErrors.some(error => error.includes('thiếu item')));

  const reordered = {
    ...valid,
    printGroups: [
      { id: 'b', title: 'B. SECOND', itemIds: ['q2'] },
      { id: 'a', title: 'A. FIRST', itemIds: ['q1'] }
    ]
  };
  assert.ok(validateSet(reordered).some(error => error.includes('giữ nguyên thứ tự item')));
});

test('printGroups validation stays safe for malformed items and rejects ambiguous Reading grouping', () => {
  const malformed = {
    id: 'malformed-print-groups',
    items: [null, mcq('q1')],
    printGroups: [{ id: 'a', title: 'A. TEST', itemIds: ['q1'] }]
  };
  assert.doesNotThrow(() => validateSet(malformed));
  assert.ok(validateSet(malformed).some(error => error.includes('Item không hợp lệ')));

  const readingWithGroups = {
    id: 'reading-with-groups',
    passages: [{ id: 'p1', title: 'Passage', text: 'Text' }],
    items: [mcq('q1')],
    printGroups: [{ id: 'a', title: 'A. TEST', itemIds: ['q1'] }]
  };
  assert.ok(validateSet(readingWithGroups).some(error => error.includes('không được dùng printGroups cùng passages')));
  assert.throws(
    () => buildLessonPrintModel(readingWithGroups, { version: 'student' }),
    /cannot also define printGroups/
  );
});
