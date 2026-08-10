import test from 'node:test';
import assert from 'node:assert/strict';
import { questionTypeForItem } from '../src/core/questionTypes.js';
import { validateSet } from '../src/data/contentValidator.js';
import { listSetsByFolder, loadLessonSet } from '../src/repositories/lessonRepository.js';

const ids = Array.from({ length: 9 }, (_, index) => `g2-u6-translation-${String(index + 1).padStart(2, '0')}`);
const counts = [7, 7, 7, 7, 9, 9, 9, 10, 10];
const targets = [
  'There is a fox on the farm.',
  'There is an ox on the farm.',
  'There is a fox in the box.',
  'Is there a fox on the farm?',
  'Is there an ox on the farm? Yes, there is.',
  'Is there a fox on the farm? Yes, there is.',
  'Is there an ox on the farm? Yes, there is.',
  "Is there a fox in the box? No, there isn't.",
  "Is there an ox in the box? No, there isn't."
];

test('Global 2 Unit 6 translation folder publishes exactly nine fixed Typing lessons', () => {
  const lessons = listSetsByFolder('global2-unit6-translation');
  assert.deepEqual(lessons.map(lesson => lesson.id), ids);
  assert.deepEqual(lessons.map(lesson => lesson.itemCount), counts);
  assert.equal(lessons.reduce((sum, lesson) => sum + lesson.itemCount, 0), 75);
  assert.equal(new Set(lessons.map(lesson => lesson.lessonSlug)).size, 9);

  for (const [index, lesson] of lessons.entries()) {
    assert.deepEqual(lesson.activityTypes, ['typing']);
    assert.equal(lesson.completionPolicy, 'all-items');
    assert.equal(lesson.typingTolerance, true);
    assert.equal(lesson.difficulty, index >= 4 ? 'hard' : undefined);
    assert.doesNotMatch(lesson.title, /\b(?:there|is|fox|ox|farm|box|yes|no|isn't)\b/i);
  }
});

test('all nine lessons are independent, validated and use article chunks instead of bare nouns', async () => {
  for (const [index, id] of ids.entries()) {
    const lesson = await loadLessonSet(id);
    assert.deepEqual(validateSet(lesson), []);
    assert.equal(lesson.items.length, counts[index]);
    assert.ok(lesson.items.every(item => questionTypeForItem(item) === 'typing'));
    assert.ok(lesson.items.every(item => typeof item.vi === 'string' && typeof item.en === 'string'));

    const answers = lesson.items.map(item => item.en);
    assert.equal(answers.some(answer => ['fox', 'ox', 'farm', 'box'].includes(answer)), false);
    assert.ok(answers.includes(index === 1 || index === 4 || index === 6 || index === 8 ? 'an ox' : 'a fox'));
    assert.ok(answers.includes(index === 2 || index === 7 || index === 8 ? 'the box' : 'the farm'));
    assert.equal(lesson.items.at(-1).en, targets[index]);
  }
});

test('meaning cores are stable across the relevant independent lessons', async () => {
  for (const index of [0, 1, 2]) {
    const lesson = await loadLessonSet(ids[index]);
    assert.ok(lesson.items.some(item => item.vi === 'ở đó có' && item.en === 'there is'));
  }
  for (const index of [3, 4, 5, 6, 7, 8]) {
    const lesson = await loadLessonSet(ids[index]);
    assert.ok(lesson.items.some(item => item.vi === 'ở đó có ... không?' && item.en === 'is there'));
  }
  for (const index of [7, 8]) {
    const lesson = await loadLessonSet(ids[index]);
    assert.ok(lesson.items.some(item => item.vi === 'ở đó không có' && item.en === "there isn't"));
  }
});

test('lesson 5 and lesson 7 intentionally repeat the same target but remain full independent lessons', async () => {
  const lesson5 = await loadLessonSet(ids[4]);
  const lesson7 = await loadLessonSet(ids[6]);
  assert.equal(lesson5.items.length, 9);
  assert.equal(lesson7.items.length, 9);
  assert.equal(lesson5.items.at(-1).en, lesson7.items.at(-1).en);
  assert.notEqual(lesson5.id, lesson7.id);
  assert.notEqual(lesson5.lessonSlug, lesson7.lessonSlug);
});
