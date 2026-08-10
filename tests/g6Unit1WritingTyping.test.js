import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U1WritingFolders, g6U1WritingRegistry } from '../src/data/g6-u1-writing-typing-catalog.js';
import { g6U1SourceSentences, getG6U1WritingTypingContent } from '../src/data/g6-u1-writing-typing-content.js';

test('Global 6 Unit 1 publishes 42 micro-lessons under 9 structures plus Final Writing', () => {
  assert.equal(g6U1WritingRegistry.length, 42);
  assert.equal(g6U1WritingFolders.length, 12);
  assert.deepEqual(g6U1WritingFolders.slice(0, 2).map(folder => folder.id), ['global6', 'global6-unit1-writing-typing']);
  assert.equal(g6U1WritingFolders.filter(folder => folder.parentId === 'global6-unit1-writing-typing').length, 10);

  const counts = new Map();
  for (const lesson of g6U1WritingRegistry) counts.set(lesson.folderId, (counts.get(lesson.folderId) ?? 0) + 1);
  assert.equal(counts.get('global6-unit1-writing-s1'), 4);
  assert.equal(counts.get('global6-unit1-writing-s2'), 4);
  assert.equal(counts.get('global6-unit1-writing-s3'), 5);
  assert.equal(counts.get('global6-unit1-writing-s4'), 4);
  assert.equal(counts.get('global6-unit1-writing-s5'), 4);
  assert.equal(counts.get('global6-unit1-writing-s6'), 5);
  assert.equal(counts.get('global6-unit1-writing-s7'), 4);
  assert.equal(counts.get('global6-unit1-writing-s8'), 4);
  assert.equal(counts.get('global6-unit1-writing-s9'), 5);
  assert.equal(counts.get('global6-unit1-writing-final'), 3);
});

test('every G6 lesson obeys the 20-minute design cap and WORD → PHRASE → SENTENCE contract', () => {
  const expectedStages = ['word', 'word', 'word', 'phrase', 'phrase', 'phrase', 'sentence', 'sentence', 'sentence'];

  for (const descriptor of g6U1WritingRegistry) {
    assert.ok(Number.isInteger(descriptor.expectedTimeMinutes), `${descriptor.id} missing expected time`);
    assert.ok(descriptor.expectedTimeMinutes >= 1 && descriptor.expectedTimeMinutes <= 20, `${descriptor.id} exceeds time cap`);
    assert.equal(descriptor.itemCount, 9);
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.equal(descriptor.typingTolerance, false);
    assert.match(descriptor.subtitle, /WORD → PHRASE → SENTENCE/);

    const key = descriptor.id.replace('g6-u1-writing-', '');
    const content = getG6U1WritingTypingContent(key);
    assert.equal(content.items.length, 9);
    assert.deepEqual(content.items.map(item => item.stage), expectedStages);
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), []);

    for (const sentence of content.items.filter(item => item.stage === 'sentence')) {
      assert.ok(sentence.teachingFeedback);
      assert.match(sentence.teachingFeedback.theory, /MINDSET FIRST/);
      assert.ok(sentence.teachingFeedback.reason.length > 0);
    }
  }
});

test('all 50 approved Unit 1 Writing output sentences appear exactly as sentence-stage answers', () => {
  assert.equal(g6U1SourceSentences.length, 50);
  const answers = new Set(
    g6U1WritingRegistry.flatMap(descriptor => {
      const key = descriptor.id.replace('g6-u1-writing-', '');
      return getG6U1WritingTypingContent(key).items
        .filter(item => item.stage === 'sentence')
        .map(item => item.en);
    })
  );
  const missing = g6U1SourceSentences.filter(sentence => !answers.has(sentence));
  assert.deepEqual(missing, []);
});

test('sourceSentenceIds trace covers 1–50 and fixed lesson identity is unique', () => {
  const traced = new Set(g6U1WritingRegistry.flatMap(lesson => lesson.sourceSentenceIds ?? []));
  assert.deepEqual([...traced].sort((a, b) => a - b), Array.from({ length: 50 }, (_, index) => index + 1));
  assert.equal(new Set(g6U1WritingRegistry.map(lesson => lesson.id)).size, 42);
  assert.equal(new Set(g6U1WritingRegistry.map(lesson => lesson.lessonSlug)).size, 42);
  assert.ok(g6U1WritingRegistry.every(lesson => lesson.expectedTimeMinutes <= 20));
});

test('Final Writing lessons keep the source paragraph progression and use 20-minute caps', () => {
  const finals = g6U1WritingRegistry.filter(lesson => lesson.folderId === 'global6-unit1-writing-final');
  assert.equal(finals.length, 3);
  assert.ok(finals.every(lesson => lesson.expectedTimeMinutes === 20 && lesson.difficulty === 'hard'));

  for (const descriptor of finals) {
    const key = descriptor.id.replace('g6-u1-writing-', '');
    const content = getG6U1WritingTypingContent(key);
    const finalAnswer = content.items.at(-1).en;
    assert.ok(finalAnswer.split(/\s+/).length >= 40);
    assert.ok(finalAnswer.split(/\s+/).length <= 60);
  }
});
