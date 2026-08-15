import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const WORD_TARGETS = Object.freeze([
  'secondary', 'first', 'week', 'school', 'lessons', 'have', 'Friday', 'creative', 'students', 'paintings',
  'art', 'club', 'English', 'classes', 'today', 'often', 'afternoon', 'most', 'children', 'excited'
]);

const CHUNK_TARGETS = Object.freeze([
  'secondary school', 'first week', 'your first week', 'how is', 'how many lessons', 'do you have', 'on Friday',
  'some creative students', 'do paintings', 'in the art club', 'English classes', 'at school today', 'go shopping',
  'in the afternoon', 'most children', 'first day of school'
]);

const FINAL_SENTENCES = Object.freeze([
  'How is your first week at secondary school?',
  'How many lessons do you have on Friday?',
  'Some creative students do paintings in the art club.',
  "We don't have English classes at school today.",
  "She doesn't often go shopping in the afternoon.",
  'Most children are excited on the first day of school.'
]);

const SOURCE_TOKEN_POOLS = Object.freeze([
  ['secondary', 'first', 'your', 'at', 'school', 'is', 'how', 'week?'],
  ['lessons', 'have', 'on', 'how many', 'you', 'do', 'Friday?'],
  ['art', 'paintings', 'creative students', 'the', 'some', 'do', 'in', 'club'],
  ['school', 'at', 'English', 'we', 'have', 'classes', "don't", 'today'],
  ['in', 'go shopping', 'she', 'often', 'the afternoon', "doesn't"],
  ['children', 'first', 'on', 'most', 'school', 'excited', 'are', 'day', 'of', 'the']
]);

function printQuestions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

test('G6 U1 Mai Lan Huong Writing Sentence Building is one 64-question published flow', async () => {
  const descriptor = getSetDescriptorBySlug('g6u1-mlh-writing-reorder-01');
  assert.ok(descriptor);
  assert.equal(descriptor.id, 'g6-u1-mlh-writing-reorder-01');
  assert.equal(descriptor.folderId, 'global6-unit1-mlh-writing');
  assert.equal(descriptor.course, 'Global Success 6');
  assert.equal(descriptor.unit, 'Unit 1 · My New School');
  assert.equal(descriptor.itemCount, 64);
  assert.deepEqual(descriptor.activityTypes, ['typing', 'mcq', 'sentence_order']);
  assert.equal(descriptor.printGroups.length, 5);

  const lesson = await loadLessonSet(descriptor.id);
  assert.equal(lesson.items.length, 64);
  assert.deepEqual(validateSet(lesson), []);
  assert.deepEqual(
    lesson.items.map(item => item.id),
    Array.from({ length: 64 }, (_, index) => `g6u1-mlh-wr-q${String(index + 1).padStart(2, '0')}`)
  );
});

test('Q1-Q20 require exact WORD recall with Vietnamese + POS/morphology', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-reorder-01');
  const words = lesson.items.slice(0, 20);
  assert.deepEqual(words.map(item => item.en), WORD_TARGETS);
  for (const item of words) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'word');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + từ loại');
    assert.match(item.vi, /Thầy:/);
    assert.match(item.vi, /(danh từ|tính từ|động từ|trạng từ|plural noun|proper noun|quantifier|ordinal)/i);
  }
  assert.equal(words[4].en, 'lessons');
  assert.match(words[4].vi, /số nhiều|plural noun/i);
  assert.equal(words[18].en, 'children');
  assert.match(words[18].vi, /số nhiều|plural noun/i);
});

test('Q21-Q36 build chunks by meaning + exact word count without POS labels', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-reorder-01');
  const chunks = lesson.items.slice(20, 36);
  assert.deepEqual(chunks.map(item => item.en), CHUNK_TARGETS);
  for (const item of chunks) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'phrase');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + số từ');
    assert.doesNotMatch(item.vi, /(adj\.|noun|verb|adverb|plural noun|proper noun)/i);
    const match = item.vi.match(/cụm (\d+) từ/i);
    assert.ok(match, `${item.id} must state chunk length`);
    assert.equal(item.en.trim().split(/\s+/).length, Number(match[1]), `${item.id} chunk length must match label`);
  }
});

test('Q37-Q46 train MAKE SENSE vs THIẾU MẢNH vs NOT MAKE SENSE before sentence grammar', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-reorder-01');
  const sense = lesson.items.slice(36, 46);
  const expected = ['sense', 'missing', 'sense', 'sense', 'sense', 'nonsense', 'sense', 'nonsense', 'sense', 'sense'];
  assert.deepEqual(sense.map(item => item.correctChoiceId), expected);
  for (const item of sense) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.stage, 'sentence');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.choices.length, 3);
    assert.deepEqual(new Set(item.choices.map(choice => choice.id)), new Set(['sense', 'missing', 'nonsense']));
    assert.ok(item.choices.every(choice => choice.feedback?.startsWith('Thầy:')));
  }
});

test('Q47-Q58 explicitly teach WH, auxiliary/be, complete subject, verb core and place/time', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-reorder-01');
  const skeleton = lesson.items.slice(46, 58);
  assert.equal(skeleton.length, 12);
  assert.ok(skeleton.every(item => item.type === 'mcq' && item.choices.length === 4));
  assert.ok(skeleton.every(item => item.theorySupport?.access === 'after_submit'));

  assert.equal(skeleton[0].choices.find(choice => choice.id === skeleton[0].correctChoiceId)?.text, 'How');
  assert.match(skeleton[1].choices.find(choice => choice.id === skeleton[1].correctChoiceId)?.text, /How \+ is \+ your first week/);
  assert.equal(skeleton[2].choices.find(choice => choice.id === skeleton[2].correctChoiceId)?.text, 'How many lessons');
  assert.match(skeleton[3].choices.find(choice => choice.id === skeleton[3].correctChoiceId)?.text, /do \+ you \+ have/);
  assert.equal(skeleton[4].choices.find(choice => choice.id === skeleton[4].correctChoiceId)?.text, 'Some creative students');
  assert.equal(skeleton[6].choices.find(choice => choice.id === skeleton[6].correctChoiceId)?.text, 'we');
  assert.equal(skeleton[8].choices.find(choice => choice.id === skeleton[8].correctChoiceId)?.text, 'she');
  assert.equal(skeleton[10].choices.find(choice => choice.id === skeleton[10].correctChoiceId)?.text, 'Most children');
});

test('Q59-Q64 only then expose the six original source token pools for final Sentence Order', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-reorder-01');
  const orders = lesson.items.slice(58);
  assert.equal(orders.length, 6);
  for (const [index, item] of orders.entries()) {
    assert.equal(item.type, 'sentence_order');
    assert.equal(item.stage, 'sentence');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.deepEqual(item.tokens, SOURCE_TOKEN_POOLS[index]);
    assert.deepEqual(item.displayOrder, SOURCE_TOKEN_POOLS[index]);
    assert.equal(item.teachingFeedback?.correctLabel, FINAL_SENTENCES[index]);
    assert.deepEqual(item.acceptedOrders, [item.correctOrder]);
  }
  assert.deepEqual(orders.map(item => item.teachingFeedback.correctLabel), FINAL_SENTENCES);
});

test('all 64 items hide theory before response in Student print while Teacher Full keeps explanations', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-reorder-01');
  assert.ok(lesson.items.every(item => item.theorySupport?.access === 'after_submit'));

  const student = printQuestions(buildLessonPrintModel(lesson, { version: 'student' }));
  const recall = printQuestions(buildLessonPrintModel(lesson, { version: 'student', showStudentTheory: false }));
  const teacher = printQuestions(buildLessonPrintModel(lesson, { version: 'teacher', teacherDetail: 'full' }));
  assert.equal(student.length, 64);
  assert.equal(teacher.length, 64);
  for (const question of student) assert.equal('studentTheory' in question, false, `${question.id} must not reveal after_submit theory`);
  for (const question of recall) assert.equal('studentTheory' in question, false, `${question.id} recall must remain theory-free`);
  for (const question of teacher) assert.ok(question.teacher?.theory, `${question.id} should retain Teacher theory`);
});

test('Brain v1.2 diagnostics lock Whole Subject, ONE/MANY/SPECIAL and ONE JOB without changing answers', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-writing-reorder-01');
  const q = number => lesson.items[number - 1];

  assert.match(q(9).teachingFeedback.theory, /students.*MANY|MANY.*students/i);
  assert.match(q(19).teachingFeedback.theory, /children.*MANY/i);
  assert.match(q(38).teachingFeedback.theory, /Whole Subject.*your first week.*ONE.*IS/i);

  assert.match(q(50).teachingFeedback.theory, /YOU = SPECIAL.*DO.*ONE JOB.*HAVE/i);
  assert.match(q(51).teachingFeedback.theory, /Whole Subject.*Some creative students.*students.*MANY/i);
  assert.match(q(54).choices.find(choice => choice.id === 'b')?.feedback ?? '', /DOUBLE MARKING.*DON’T.*HAS.*DON’T \+ HAVE/i);
  assert.match(q(56).choices.find(choice => choice.id === 'b')?.feedback ?? '', /DOUBLE MARKING.*DOESN.*GO/i);
  const q57Theory = q(57).teachingFeedback.theory;
  assert.match(q57Theory, /Most children/i);
  assert.match(q57Theory, /children.*MANY/i);
  assert.match(q57Theory, /LETTER S/i);
  assert.match(q(58).teachingFeedback.theory, /AURA.*Most children.*MANY.*ARE/i);

  assert.match(q(64).teachingFeedback.theory, /AURA.*Most children.*children.*MANY.*ARE/i);
  assert.deepEqual(q(64).correctOrder, ['most', 'children', 'are', 'excited', 'on', 'the', 'first', 'day', 'of', 'school']);
});
