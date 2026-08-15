import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const WORD_TARGETS = Object.freeze([
  'smart', 'classmates', 'uniforms', 'subjects',
  'boarding', 'international', 'favourite', 'library'
]);

const CHUNK_TARGETS = Object.freeze([
  'looks very smart',
  'new uniform',
  'same class',
  'wear school uniforms',
  'favourite subjects',
  'maths and science',
  'boarding school',
  'study and live',
  'international schools',
  'in English',
  'favourite teacher',
  'teaches us history',
  'borrow them',
  'at home'
]);

const APPLICATION_ANSWERS = Object.freeze([
  'smart', 'classmates', 'uniforms', 'subjects',
  'boarding', 'international', 'favourite', 'library'
]);

function printQuestions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

test('G6 U1 Mai Lan Huong vocabulary context lesson is published as one 30-question flow with legacy G7 link compatibility', async () => {
  const descriptor = getSetDescriptorBySlug('g6u1-mlh-vocab-context');
  const legacy = getSetDescriptorBySlug('g7u1-mlh-vocab-context');
  assert.ok(descriptor);
  assert.equal(descriptor.id, 'g7-u1-mlh-vocab-context-01');
  assert.equal(descriptor.folderId, 'global6-unit1');
  assert.equal(descriptor.course, 'Global Success 6');
  assert.equal(descriptor.unit, 'Unit 1 · My New School');
  assert.equal(descriptor.lessonSlug, 'g6u1-mlh-vocab-context');
  assert.deepEqual(descriptor.lessonSlugAliases, ['g7u1-mlh-vocab-context']);
  assert.equal(legacy?.id, descriptor.id);
  assert.equal(legacy?.lessonSlug, descriptor.lessonSlug);
  assert.equal(descriptor.itemCount, 30);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.deepEqual(descriptor.activityTypes, ['typing', 'mcq']);
  assert.equal(descriptor.printGroups.length, 3);

  const lesson = await loadLessonSet(descriptor.id);
  assert.equal(lesson.items.length, 30);
  assert.deepEqual(lesson.items.map(item => item.id), Array.from({ length: 30 }, (_, index) => `g7u1-mlh-vc-q${String(index + 1).padStart(2, '0')}`));
});

test('Q1-Q8 are exact WORD targets with Vietnamese meaning, POS, morphology and anytime theory', async () => {
  const lesson = await loadLessonSet('g7-u1-mlh-vocab-context-01');
  const words = lesson.items.slice(0, 8);

  assert.deepEqual(words.map(item => item.en), WORD_TARGETS);
  for (const item of words) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'word');
    assert.equal(item.theorySupport?.access, 'anytime');
    assert.match(item.vi, /Thầy:/);
    assert.match(item.vi, /(adj\.|noun|plural noun)/i);
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + từ loại');
    assert.ok(item.teachingFeedback?.theory);
  }

  assert.match(words[1].vi, /plural noun/i);
  assert.equal(words[1].en, 'classmates');
  assert.match(words[2].vi, /plural noun/i);
  assert.equal(words[2].en, 'uniforms');
  assert.match(words[3].vi, /plural noun/i);
  assert.equal(words[3].en, 'subjects');
  assert.equal(words[6].en, 'favourite');
});

test('Q9-Q22 are direct sentence chunks labelled only by chunk length, not POS', async () => {
  const lesson = await loadLessonSet('g7-u1-mlh-vocab-context-01');
  const chunks = lesson.items.slice(8, 22);

  assert.deepEqual(chunks.map(item => item.en), CHUNK_TARGETS);
  for (const item of chunks) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'phrase');
    assert.equal(item.theorySupport?.access, 'anytime');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + số từ');
    assert.doesNotMatch(item.vi, /(adj\.|noun|plural noun)/i);
    const match = item.vi.match(/cụm (\d+) từ/i);
    assert.ok(match, `${item.id} must state its chunk length`);
    assert.equal(item.en.trim().split(/\s+/).length, Number(match[1]), `${item.id} chunk length must match its label`);
  }
});

test('Q23-Q30 preserve the eight source sentences and use all eight shuffled-choice vocabulary targets', async () => {
  const lesson = await loadLessonSet('g7-u1-mlh-vocab-context-01');
  const application = lesson.items.slice(22);
  const expectedPrompts = [
    'Duy looks very ______ in his new uniform.',
    'Phong and Duy are in the same class at school. They are ______.',
    'Most schools require children to wear school ______.',
    'My favourite ______ at school are maths and science.',
    'A ______ school is a school where students study and live during the school year.',
    'At ______ schools, students learn subjects in English with English-speaking teachers.',
    'What is your ______ teacher, Dane? ~ Ms. Harper. She teaches us history.',
    'In the ______, you can read books and papers or borrow them to read at home.'
  ];

  assert.deepEqual(application.map(item => item.prompt), expectedPrompts);
  assert.deepEqual(application.map(item => item.correctChoiceId), APPLICATION_ANSWERS);

  for (const item of application) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.choices.length, 8);
    assert.deepEqual(new Set(item.choices.map(choice => choice.text)), new Set(WORD_TARGETS));
    assert.ok(item.choices.every(choice => typeof choice.feedback === 'string' && choice.feedback.startsWith('Thầy:')), `${item.id} must have all 8 Thầy–con choice explanations`);
    assert.equal(item.choices.filter(choice => choice.id === item.correctChoiceId).length, 1);
    assert.ok(item.teachingFeedback?.reason.startsWith('Thầy:'));
  }

  assert.equal(application.reduce((sum, item) => sum + item.choices.length, 0), 64);
});

test('Student PDF mirrors scaffold withdrawal for the corrected 30-question lesson', async () => {
  const lesson = await loadLessonSet('g7-u1-mlh-vocab-context-01');
  const scaffolded = printQuestions(buildLessonPrintModel(lesson, { version: 'student' }));
  const recall = printQuestions(buildLessonPrintModel(lesson, { version: 'student', showStudentTheory: false }));

  assert.equal(scaffolded.length, 30);
  for (const question of scaffolded.slice(0, 22)) assert.ok(question.studentTheory?.theory, `${question.id} should expose anytime theory by default`);
  for (const question of scaffolded.slice(22)) assert.equal('studentTheory' in question, false, `${question.id} must hide after_submit theory`);
  for (const question of recall) assert.equal('studentTheory' in question, false, `${question.id} must be scaffold-free when theory is toggled off`);
});
