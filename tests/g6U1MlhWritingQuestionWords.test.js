import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const WORD_TARGETS = Object.freeze([
  'first', 'lesson', 'begin', 'live', 'usually', 'bring', 'textbooks', 'notebooks', 'pens',
  'help', 'homework', 'favourite', 'subject', 'day', 'do', 'students', 'class', 'money'
]);

const CHUNK_TARGETS = Object.freeze([
  'the first lesson', 'begin at seven o’clock', 'live on Nguyen Trai Street', 'bring to school',
  'textbooks, notebooks and pens', 'by bike', 'help you with your homework', 'your favourite subject',
  'first day at school', 'do judo', 'three times a week', 'students in your class', 'pocket money',
  'ten thousand dongs'
]);

const SOURCE_ANSWERS = Object.freeze([
  'when', 'where', 'what', 'how', 'who', 'what', 'how', 'how-often', 'how-many', 'how-much'
]);

const SOURCE_PROMPTS = Object.freeze([
  '_____ does the first lesson begin? – At seven o’clock.',
  '_____ do you live? – I live on Nguyen Trai Street.',
  '_____ do you usually bring to school? – Textbooks, notebooks and pens.',
  '_____ do you go to school? – By bike.',
  '_____ often helps you with your homework? – My sister.',
  '_____ is your favourite subject? – Maths.',
  '_____ is your first day at school? – Oh, it’s great.',
  '_____ does Phong do judo? – Three times a week.',
  '_____ students are there in your class? – Forty.',
  '_____ pocket money do you get? – Ten thousand dongs.'
]);

const WH_IDS = Object.freeze(['what', 'when', 'where', 'how', 'who', 'how-often', 'how-many', 'how-much']);

function printQuestions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

test('G6 U1 MLH Question Words is one 66-question published flow in Writing order 3', async () => {
  const descriptor = getSetDescriptorBySlug('g6u1-mlh-writing-question-words-01');
  assert.ok(descriptor);
  assert.equal(descriptor.id, 'g6-u1-mlh-writing-question-words-01');
  assert.equal(descriptor.folderId, 'global6-unit1-mlh-writing');
  assert.equal(descriptor.order, 3);
  assert.equal(descriptor.course, 'Global Success 6');
  assert.equal(descriptor.unit, 'Unit 1 · My New School');
  assert.equal(descriptor.itemCount, 66);
  assert.deepEqual(descriptor.activityTypes, ['mcq', 'typing']);
  assert.equal(descriptor.printGroups.length, 6);

  const lesson = await loadLessonSet(descriptor.id);
  assert.equal(lesson.items.length, 66);
  assert.deepEqual(validateSet(lesson), []);
  assert.deepEqual(
    lesson.items.map(item => item.id),
    Array.from({ length: 66 }, (_, index) => `g6u1-mlh-wh-q${String(index + 1).padStart(2, '0')}`)
  );
});

test('Q1-Q8 teach all eight WH words with anytime theory and examples', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const foundation = lesson.items.slice(0, 8);
  assert.deepEqual(foundation.map(item => item.correctChoiceId), WH_IDS);
  for (const item of foundation) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.stage, undefined);
    assert.equal(item.theorySupport?.access, 'anytime');
    assert.equal(item.choices.length, 8);
    assert.ok(item.teachingFeedback?.theory?.startsWith('LÝ THUYẾT NỀN'));
    assert.ok(item.teachingFeedback?.example);
  }
});

test('Q9-Q16 train Vietnamese intent to WH without pre-answer theory', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const intent = lesson.items.slice(8, 16);
  assert.deepEqual(intent.map(item => item.correctChoiceId), ['when', 'where', 'what', 'how', 'who', 'how-often', 'how-many', 'how-much']);
  assert.ok(intent.every(item => item.type === 'mcq' && item.choices.length === 8));
  assert.ok(intent.every(item => item.stage === undefined));
  assert.ok(intent.every(item => item.theorySupport?.access === 'after_submit'));
  assert.match(intent[4].teachingFeedback.theory, /PERSON.*WHO/i);
});

test('Q17-Q34 cover the source vocabulary with Vietnamese to English typing', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const words = lesson.items.slice(16, 34);
  assert.deepEqual(words.map(item => item.en), WORD_TARGETS);
  assert.equal(words.length, 18);
  for (const item of words) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'word');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.match(item.vi, /^Thầy:/);
  }
  assert.match(words[2].teachingFeedback.theory, /DOES.*BEGIN/i);
  assert.match(words[14].teachingFeedback.theory, /Phong = ONE.*DOES.*ONE JOB.*DO judo/i);
  assert.match(words[15].teachingFeedback.theory, /students = MANY/i);
});

test('Q35-Q48 build all fourteen source chunks before application', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const chunks = lesson.items.slice(34, 48);
  assert.equal(chunks.length, 14);
  assert.deepEqual(chunks.map(item => item.en), CHUNK_TARGETS);
  assert.ok(chunks.every(item => item.type === 'typing' && item.stage === 'phrase'));
  assert.ok(chunks.every(item => item.theorySupport?.access === 'after_submit'));
  assert.match(chunks[5].teachingFeedback.theory, /MANNER.*HOW/i);
  assert.match(chunks[10].teachingFeedback.theory, /FREQUENCY.*HOW OFTEN/i);
  assert.match(chunks[12].teachingFeedback.theory, /MONEY.*HOW MUCH/i);
});

test('Q49-Q56 force answer meaning to information type before WH selection', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const info = lesson.items.slice(48, 56);
  assert.equal(info.length, 8);
  assert.ok(info.every(item => item.type === 'mcq' && item.stage === 'sentence'));
  assert.ok(info.every(item => item.theorySupport?.access === 'after_submit'));
  assert.deepEqual(info.map(item => item.correctChoiceId), ['time', 'place', 'thing', 'manner', 'person', 'frequency', 'count', 'money']);
  assert.match(info[0].teachingFeedback.theory, /TIME.*WHEN/i);
  assert.match(info[4].teachingFeedback.theory, /PERSON.*WHO/i);
  assert.match(info[7].teachingFeedback.theory, /MONEY.*HOW MUCH/i);
});

test('Q57-Q66 preserve the ten Mai Lan Huong source questions with the full eight-WH bank', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const source = lesson.items.slice(56, 66);
  assert.equal(source.length, 10);
  assert.deepEqual(source.map(item => item.prompt), SOURCE_PROMPTS);
  assert.deepEqual(source.map(item => item.correctChoiceId), SOURCE_ANSWERS);
  for (const item of source) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.stage, 'sentence');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.choices.length, 8);
    assert.deepEqual(new Set(item.choices.map(choice => choice.id)), new Set(WH_IDS));
    assert.ok(item.choices.every(choice => choice.feedback?.startsWith('Thầy:')));
  }
});

test('source feedback locks key traps and Mr Thanh Brain v1.2 boundaries', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const q = number => lesson.items[number - 1];

  assert.match(q(57).teachingFeedback.theory, /Whole Subject.*first lesson.*ONE.*DOES.*ONE JOB.*BEGIN/i);
  assert.match(q(58).teachingFeedback.theory, /YOU = SPECIAL.*DO.*ONE JOB.*LIVE/i);
  assert.match(q(61).choices.find(choice => choice.id === 'how-often')?.feedback ?? '', /bẫy.*often.*My sister.*NGƯỜI.*WHO/i);
  assert.match(q(61).teachingFeedback.theory, /WHO.*Whole Subject.*subject question.*không thêm DO\/DOES/i);
  assert.match(q(63).teachingFeedback.theory, /day = ONE.*AURA.*IS/i);
  assert.match(q(64).teachingFeedback.theory, /Phong = ONE.*DOES.*ONE JOB.*DO judo/i);
  assert.match(q(65).teachingFeedback.theory, /STANDARD GRAMMAR BOUNDARY.*existential THERE/i);
  assert.match(q(66).choices.find(choice => choice.id === 'how-many')?.feedback ?? '', /how many pocket moneys.*HOW MUCH/i);
});

test('Student print shows only foundation anytime theory while Teacher Full keeps all explanations', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-question-words-01');
  const student = printQuestions(buildLessonPrintModel(lesson, { version: 'student' }));
  const recall = printQuestions(buildLessonPrintModel(lesson, { version: 'student', showStudentTheory: false }));
  const teacher = printQuestions(buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' }));

  assert.equal(student.length, 66);
  assert.equal(recall.length, 66);
  assert.equal(teacher.length, 66);
  for (const question of student.slice(0, 8)) assert.ok(question.studentTheory?.theory, `${question.id} should show foundation theory`);
  for (const question of student.slice(8)) assert.equal('studentTheory' in question, false, `${question.id} must hide after_submit theory`);
  for (const question of recall) assert.equal('studentTheory' in question, false, `${question.id} recall must hide all theory`);
  for (const question of teacher) assert.ok(question.teacher?.theory, `${question.id} should retain Teacher Full theory`);
});
