import test from 'node:test';
import assert from 'node:assert/strict';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const WORD_TARGETS = Object.freeze([
  'qualities', 'classmate', 'decide', 'statements', 'helpful', 'responsible', 'respectful', 'rude',
  'impatient', 'bully', 'support', 'health', 'recess', 'invites', 'never', 'sometimes'
]);

const CHUNK_TARGETS = Object.freeze([
  'a good classmate', 'helps others', 'works hard', 'tries his/her best', 'says thank you',
  'how are you', 'play at recess', 'a long time', 'break time', 'a bully'
]);

const STATEMENT_FRAGMENTS = Object.freeze([
  'always tries his/her best to help and support you',
  'will never says “thank you”',
  'ask you about your health',
  'plays with you at break time',
  'bullies you sometimes'
]);

const CORRECT_CHOICE_IDS = Object.freeze([
  'true-evidence', 'false-evidence', 'true-evidence', 'true-evidence', 'false-evidence'
]);

function printQuestions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

test('G6 U1 Mai Lan Huong True/False Evidence 1 is one published 31-question flow', async () => {
  const descriptor = getSetDescriptorBySlug('g6u1-mlh-reading-tf-evidence-01');
  assert.ok(descriptor);
  assert.equal(descriptor.id, 'g6-u1-mlh-reading-tf-evidence-01');
  assert.equal(descriptor.folderId, 'global6-unit1-mlh-reading');
  assert.equal(descriptor.course, 'Global Success 6');
  assert.equal(descriptor.unit, 'Unit 1 · My New School');
  assert.equal(descriptor.itemCount, 31);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.deepEqual(descriptor.activityTypes, ['typing', 'mcq']);
  assert.equal(descriptor.printGroups.length, 3);

  const lesson = await loadLessonSet(descriptor.id);
  assert.equal(lesson.items.length, 31);
  assert.deepEqual(
    lesson.items.map(item => item.id),
    Array.from({ length: 31 }, (_, index) => `g6u1-mlh-tf-q${String(index + 1).padStart(2, '0')}`)
  );
});

test('Q1-Q16 build exact WORD meaning + POS/morphology and hide theory until submit', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-tf-evidence-01');
  const words = lesson.items.slice(0, 16);
  assert.deepEqual(words.map(item => item.en), WORD_TARGETS);

  for (const item of words) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'word');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + từ loại');
    assert.match(item.vi, /Thầy:/);
    assert.match(item.vi, /(động từ|danh từ|tính từ|trạng từ|verb|noun|adj\.|adverb)/i);
    assert.ok(item.teachingFeedback?.theory);
  }

  assert.match(words[0].vi, /số nhiều|plural noun/i);
  assert.equal(words[0].en, 'qualities');
  assert.match(words[3].vi, /số nhiều|plural noun/i);
  assert.equal(words[3].en, 'statements');
  assert.match(words[13].vi, /ngôi thứ ba số ít|V-s/i);
  assert.equal(words[13].en, 'invites');
});

test('Q17-Q26 build direct chart/statement chunks using Vietnamese meaning + chunk length only', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-tf-evidence-01');
  const chunks = lesson.items.slice(16, 26);
  assert.deepEqual(chunks.map(item => item.en), CHUNK_TARGETS);

  for (const item of chunks) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'phrase');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + số từ');
    assert.doesNotMatch(item.vi, /(adj\.|noun|verb|adverb|plural noun|singular noun)/i);
    const match = item.vi.match(/cụm (\d+) từ/i);
    assert.ok(match, `${item.id} must state chunk length`);
    assert.equal(item.en.trim().split(/\s+/).length, Number(match[1]), `${item.id} chunk length must match label`);
  }
});

test('Q27-Q31 require T/F plus a matching reason and preserve the full chart on every item', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-tf-evidence-01');
  const application = lesson.items.slice(26);
  assert.deepEqual(application.map(item => item.correctChoiceId), CORRECT_CHOICE_IDS);

  const chartText = application[0].stimulus.text;
  for (const [index, item] of application.entries()) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.stimulus.text, chartText);
    assert.equal(item.stimulus.promptLabel, 'STATEMENT → FIND EVIDENCE → CHECK MATCH → CHOOSE T/F + REASON');
    assert.equal(item.choices.length, 4);
    assert.equal(item.choices.filter(option => option.text.startsWith('TRUE')).length, 2);
    assert.equal(item.choices.filter(option => option.text.startsWith('FALSE')).length, 2);
    assert.ok(item.choices.every(option => typeof option.feedback === 'string' && option.feedback.startsWith('Thầy:')));
    assert.match(item.prompt, new RegExp(STATEMENT_FRAGMENTS[index].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(item.teachingFeedback?.reason ?? '', /Thầy:/);
    assert.match(item.teachingFeedback?.theory ?? '', /EVIDENCE \+ MATCH:/);
    assert.match(item.teachingFeedback?.theory ?? '', /BẪY CẦN TRÁNH:/);
  }

  for (const marker of ['IS —', 'DOES —', 'SAYS —', 'IS NOT —', 'helps others', 'tries his/her best', '“Thank you”', '“How are you?”', 'play at recess', 'a bully']) {
    assert.ok(chartText.includes(marker), `chart must retain ${marker}`);
  }

  assert.equal(application.reduce((sum, item) => sum + item.choices.length, 0), 20);
});

test('evidence MCQ renderer shows the reasoning instruction and full chart instead of a generic Main Idea label', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-tf-evidence-01');
  const html = renderQuestionInteraction(lesson.items[26], { exposureKey: 'tf-evidence-test' });
  assert.match(html, /STATEMENT → FIND EVIDENCE → CHECK MATCH → CHOOSE T\/F \+ REASON/);
  assert.doesNotMatch(html, /Main Idea/);
  assert.match(html, /A GREAT CLASSMATE/);
  assert.match(html, /IS NOT/);
  assert.match(html, /TRUE/);
  assert.match(html, /FALSE/);
});

test('Student PDF never exposes answer-bearing theory while full Teacher PDF keeps evidence reasoning', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-tf-evidence-01');
  const student = printQuestions(buildLessonPrintModel(lesson, { version: 'student' }));
  const recall = printQuestions(buildLessonPrintModel(lesson, { version: 'student', showStudentTheory: false }));
  const teacher = printQuestions(buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' }));

  assert.equal(student.length, 31);
  assert.equal(teacher.length, 31);
  for (const question of student) assert.equal('studentTheory' in question, false, `${question.id} must not expose after_submit theory`);
  for (const question of recall) assert.equal('studentTheory' in question, false, `${question.id} must stay theory-free`);
  for (const question of teacher) assert.ok(question.teacher?.theory, `${question.id} must retain theory in Teacher print`);

  for (const question of student.slice(26)) {
    assert.ok(question.stimulus?.text);
    assert.match(question.stimulus.text, /IS NOT/);
  }
});
