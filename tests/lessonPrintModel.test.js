import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';
import { validateSet } from '../src/data/contentValidator.js';

function questions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
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

test('optional printGroups are organizational metadata only and validator requires exact item coverage', () => {
  const item = { id: 'q1', type: 'mcq', prompt: 'Choose', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'a' };
  const valid = { id: 'print-groups', items: [item], printGroups: [{ id: 'a', title: 'A. TEST', itemIds: ['q1'] }] };
  assert.deepEqual(validateSet(valid), []);
  const missing = { ...valid, printGroups: [{ id: 'a', title: 'A. TEST', itemIds: ['missing'] }] };
  const errors = validateSet(missing);
  assert.ok(errors.some(error => error.includes('không tồn tại')));
  assert.ok(errors.some(error => error.includes('thiếu item')));
});
