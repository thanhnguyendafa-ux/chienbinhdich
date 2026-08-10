import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U1WritingFolders, g7U1WritingRegistry } from '../src/data/g7-u1-writing-typing-catalog.js';
import { g7U1SourceSentences, getG7U1WritingTypingContent } from '../src/data/g7-u1-writing-typing-content.js';

test('Global 7 Unit 1 publishes 44 micro-lessons under 10 structures plus Final Writing', () => {
  assert.equal(g7U1WritingRegistry.length, 44);
  assert.equal(g7U1WritingFolders.length, 12);
  assert.equal(g7U1WritingFolders[0].id, 'global7-unit1-writing-typing');
  assert.equal(g7U1WritingFolders.filter(folder => folder.parentId === 'global7-unit1-writing-typing').length, 11);

  const counts = new Map();
  for (const lesson of g7U1WritingRegistry) counts.set(lesson.folderId, (counts.get(lesson.folderId) ?? 0) + 1);
  assert.equal(counts.get('global7-unit1-writing-s1'), 4);
  assert.equal(counts.get('global7-unit1-writing-s2'), 4);
  assert.equal(counts.get('global7-unit1-writing-s3'), 4);
  assert.equal(counts.get('global7-unit1-writing-s4'), 5);
  assert.equal(counts.get('global7-unit1-writing-s5'), 3);
  assert.equal(counts.get('global7-unit1-writing-s6'), 4);
  assert.equal(counts.get('global7-unit1-writing-s7'), 3);
  assert.equal(counts.get('global7-unit1-writing-s8'), 4);
  assert.equal(counts.get('global7-unit1-writing-s9'), 5);
  assert.equal(counts.get('global7-unit1-writing-s10'), 5);
  assert.equal(counts.get('global7-unit1-writing-final'), 3);
});

test('every G7 lesson stays in the 15–20 minute cap and obeys WORD → PHRASE → SENTENCE', () => {
  const expectedStages = ['word', 'word', 'word', 'phrase', 'phrase', 'phrase', 'sentence', 'sentence', 'sentence'];

  for (const descriptor of g7U1WritingRegistry) {
    assert.ok(Number.isInteger(descriptor.expectedTimeMinutes), `${descriptor.id} missing expected time`);
    assert.ok(descriptor.expectedTimeMinutes >= 15 && descriptor.expectedTimeMinutes <= 20, `${descriptor.id} outside 15–20 minute design cap`);
    assert.equal(descriptor.itemCount, 9);
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.equal(descriptor.typingTolerance, false);
    assert.match(descriptor.subtitle, /WORD → PHRASE → SENTENCE/);

    const key = descriptor.id.replace('g7-u1-writing-', '');
    const content = getG7U1WritingTypingContent(key);
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

test('all 50 approved Unit 1 Writing outputs appear exactly as sentence-stage answers', () => {
  assert.equal(g7U1SourceSentences.length, 50);
  const answers = new Set(
    g7U1WritingRegistry.flatMap(descriptor => {
      const key = descriptor.id.replace('g7-u1-writing-', '');
      return getG7U1WritingTypingContent(key).items
        .filter(item => item.stage === 'sentence')
        .map(item => item.en);
    })
  );
  const missing = g7U1SourceSentences.filter(sentence => !answers.has(sentence));
  assert.deepEqual(missing, []);
});

test('sourceSentenceIds trace covers 1–50 and lesson identity stays unique', () => {
  const traced = new Set(g7U1WritingRegistry.flatMap(lesson => lesson.sourceSentenceIds ?? []));
  assert.deepEqual([...traced].sort((a, b) => a - b), Array.from({ length: 50 }, (_, index) => index + 1));
  assert.equal(new Set(g7U1WritingRegistry.map(lesson => lesson.id)).size, 44);
  assert.equal(new Set(g7U1WritingRegistry.map(lesson => lesson.lessonSlug)).size, 44);
});

test('Final Writing lessons build complete 40–60 word hobby paragraphs at the 20-minute cap', () => {
  const finals = g7U1WritingRegistry.filter(lesson => lesson.folderId === 'global7-unit1-writing-final');
  assert.equal(finals.length, 3);
  assert.ok(finals.every(lesson => lesson.expectedTimeMinutes === 20 && lesson.difficulty === 'hard'));

  for (const descriptor of finals) {
    const key = descriptor.id.replace('g7-u1-writing-', '');
    const content = getG7U1WritingTypingContent(key);
    const finalAnswer = content.items.at(-1).en;
    const wordCount = finalAnswer.trim().split(/\s+/).length;
    assert.ok(wordCount >= 40, `${descriptor.id} paragraph too short: ${wordCount}`);
    assert.ok(wordCount <= 60, `${descriptor.id} paragraph too long: ${wordCount}`);
  }
});
