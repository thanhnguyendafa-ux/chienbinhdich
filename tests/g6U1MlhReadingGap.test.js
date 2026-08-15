import test from 'node:test';
import assert from 'node:assert/strict';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';
import { buildLessonPrintModel } from '../src/features/admin/print/lessonPrintModel.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const WORD_TARGETS = Object.freeze([
  'includes', 'grades', 'school', 'still', 'awaits', 'big', 'change',
  'adjust', 'second', 'elementary', 'different', 'teachers', 'work', 'scared'
]);

const CHUNK_TARGETS = Object.freeze([
  'middle school', 'school years', 'elementary school', 'high school',
  'still awaits you', 'a big change', 'a new building', 'takes some time',
  'adjust to', 'a different bus', 'different students', 'different middle schools',
  'feel a bit', 'first day'
]);

const WORD_BOX = Object.freeze([
  'big', 'grades', 'elementary', 'scared', 'school', 'teachers', 'second', 'still'
]);

const GAP_ANSWERS = Object.freeze([
  'grades', 'school', 'still', 'big', 'second', 'elementary', 'teachers', 'scared'
]);

function printQuestions(model) {
  return model.sections.flatMap(section => section.blocks.flatMap(block => block.questions));
}

test('G6 U1 Mai Lan Huong Reading Gap 1 is one published 36-question flow', async () => {
  const descriptor = getSetDescriptorBySlug('g6u1-mlh-reading-gap-01');
  assert.ok(descriptor);
  assert.equal(descriptor.id, 'g6-u1-mlh-reading-gap-01');
  assert.equal(descriptor.folderId, 'global6-unit1-mlh-reading');
  assert.equal(descriptor.course, 'Global Success 6');
  assert.equal(descriptor.unit, 'Unit 1 · My New School');
  assert.equal(descriptor.itemCount, 36);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.deepEqual(descriptor.activityTypes, ['typing', 'mcq']);
  assert.equal(descriptor.printGroups.length, 3);

  const lesson = await loadLessonSet(descriptor.id);
  assert.equal(lesson.items.length, 36);
  assert.deepEqual(
    lesson.items.map(item => item.id),
    Array.from({ length: 36 }, (_, index) => `g6u1-mlh-rg-q${String(index + 1).padStart(2, '0')}`)
  );
});

test('Q1-Q14 build exact WORD meaning + POS/morphology before reading', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-gap-01');
  const words = lesson.items.slice(0, 14);
  assert.deepEqual(words.map(item => item.en), WORD_TARGETS);

  for (const item of words) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'word');
    assert.equal(item.theorySupport?.access, 'anytime');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + từ loại');
    assert.match(item.vi, /Thầy:/);
    assert.match(item.vi, /(động từ|danh từ|tính từ|trạng từ|verb|noun|adj\.|adverb)/i);
    assert.ok(item.teachingFeedback?.theory);
  }

  assert.match(words[1].vi, /số nhiều|plural noun/i);
  assert.equal(words[1].en, 'grades');
  assert.match(words[11].vi, /số nhiều|plural noun/i);
  assert.equal(words[11].en, 'teachers');
});

test('Q15-Q28 build direct passage chunks using only Vietnamese meaning + chunk length', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-gap-01');
  const chunks = lesson.items.slice(14, 28);
  assert.deepEqual(chunks.map(item => item.en), CHUNK_TARGETS);

  for (const item of chunks) {
    assert.equal(item.type, 'typing');
    assert.equal(item.stage, 'phrase');
    assert.equal(item.theorySupport?.access, 'anytime');
    assert.equal(item.typingUi?.contextLabel, 'Tiếng Việt + số từ');
    assert.doesNotMatch(item.vi, /(adj\.|noun|verb|adverb|plural noun|uncountable noun)/i);
    const match = item.vi.match(/cụm (\d+) từ/i);
    assert.ok(match, `${item.id} must state chunk length`);
    assert.equal(item.en.trim().split(/\s+/).length, Number(match[1]), `${item.id} chunk length must match label`);
  }
});

test('Q29-Q36 keep all eight source gaps blank on every question and retain the full 8-word box', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-gap-01');
  const application = lesson.items.slice(28);
  assert.deepEqual(application.map(item => item.correctChoiceId), GAP_ANSWERS);

  const passageText = application[0].stimulus.text;
  for (const [index, item] of application.entries()) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.theorySupport?.access, 'after_submit');
    assert.equal(item.stimulus.text, passageText, `${item.id} must reuse the same unresolved passage`);
    assert.match(item.stimulus.title, new RegExp(`\\(${index + 1}\\)`));
    assert.equal(item.stimulus.promptLabel, 'Đọc toàn bài → tự dịch → xét chỗ trống → chọn từ');
    assert.equal(item.choices.length, 8);
    assert.deepEqual(new Set(item.choices.map(choice => choice.text)), new Set(WORD_BOX));
    assert.ok(item.choices.every(choice => typeof choice.feedback === 'string' && choice.feedback.startsWith('Thầy:')), `${item.id} needs feedback for all eight choices`);
    assert.ok(item.teachingFeedback?.reason.startsWith('Thầy:'));

    for (let gap = 1; gap <= 8; gap += 1) {
      assert.ok(item.stimulus.text.includes(`(${gap}) ______`), `${item.id} must leave gap ${gap} blank`);
    }
    assert.equal((item.stimulus.text.match(/______/g) ?? []).length, 8, `${item.id} must show exactly eight unresolved gaps`);
  }

  assert.equal(application.reduce((sum, item) => sum + item.choices.length, 0), 64);
});

test('gap-fill stimulus uses its own learner instruction instead of the legacy Main Idea label', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-gap-01');
  const html = renderQuestionInteraction(lesson.items[28], { exposureKey: 'reading-gap-test' });
  assert.match(html, /Đọc toàn bài → tự dịch → xét chỗ trống → chọn từ/);
  assert.doesNotMatch(html, /Main Idea/);
  assert.match(html, /\(1\) ______/);
  assert.match(html, /\(8\) ______/);
});

test('Student PDF preserves scaffold withdrawal for the 36-question reading-gap lesson', async () => {
  const lesson = await loadLessonSet('g6-u1-mlh-reading-gap-01');
  const scaffolded = printQuestions(buildLessonPrintModel(lesson, { version: 'student' }));
  const recall = printQuestions(buildLessonPrintModel(lesson, { version: 'student', showStudentTheory: false }));

  assert.equal(scaffolded.length, 36);
  for (const question of scaffolded.slice(0, 28)) assert.ok(question.studentTheory?.theory, `${question.id} should expose anytime theory`);
  for (const question of scaffolded.slice(28)) {
    assert.equal('studentTheory' in question, false, `${question.id} must hide after_submit theory`);
    assert.ok(question.stimulus?.text);
    assert.equal((question.stimulus.text.match(/______/g) ?? []).length, 8);
  }
  for (const question of recall) assert.equal('studentTheory' in question, false, `${question.id} must be theory-free in recall mode`);
});
