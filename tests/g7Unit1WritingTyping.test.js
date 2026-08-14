import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U1WritingFolders, g7U1WritingRegistry } from '../src/data/g7-u1-writing-typing-published.js';
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

test('every G7 lesson keeps 15–20 minutes and uses variable WORD → 3 PHRASE → 3 SENTENCE scaffolding', () => {
  for (const descriptor of g7U1WritingRegistry) {
    assert.ok(Number.isInteger(descriptor.expectedTimeMinutes), `${descriptor.id} missing expected time`);
    assert.ok(descriptor.expectedTimeMinutes >= 15 && descriptor.expectedTimeMinutes <= 20, `${descriptor.id} outside 15–20 minute design cap`);
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.equal(descriptor.typingTolerance, false);
    assert.match(descriptor.subtitle, /WORD → PHRASE → SENTENCE/);

    const key = descriptor.id.replace('g7-u1-writing-', '');
    const content = getG7U1WritingTypingContent(key);
    const words = content.items.filter(item => item.stage === 'word');
    const phrases = content.items.filter(item => item.stage === 'phrase');
    const sentences = content.items.filter(item => item.stage === 'sentence');

    assert.equal(content.items.length, descriptor.itemCount, `${descriptor.id} itemCount mismatch`);
    assert.ok(words.length >= 3, `${descriptor.id} must keep at least three WORD retrievals`);
    assert.equal(phrases.length, 3, `${descriptor.id} must keep three PHRASE builds`);
    assert.equal(sentences.length, 3, `${descriptor.id} must keep three SENTENCE outputs`);
    assert.deepEqual(
      content.items.map(item => item.stage),
      [...Array(words.length).fill('word'), 'phrase', 'phrase', 'phrase', 'sentence', 'sentence', 'sentence'],
      `${descriptor.id} stage order must remain WORD → PHRASE → SENTENCE`
    );
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), []);

    for (const sentence of sentences) {
      assert.ok(sentence.teachingFeedback);
      assert.match(sentence.teachingFeedback.theory, /MINDSET FIRST/);
      assert.ok(sentence.teachingFeedback.reason.length > 0);
      assert.ok(sentence.buildsFrom.length > 0, `${sentence.id} must have real scaffold dependencies`);
    }
  }
});

test('G7 regression: hobby identity lesson preserves exact learner-facing surface forms', () => {
  const content = getG7U1WritingTypingContent('s1-01');
  const wordAnswers = content.items.filter(item => item.stage === 'word').map(item => item.en.toLowerCase());
  assert.ok(wordAnswers.includes('gardening'));
  assert.ok(wordAnswers.includes('taking'));
  assert.ok(wordAnswers.includes('photos'));
  assert.ok(!wordAnswers.includes('garden'));
  assert.ok(!wordAnswers.includes('take'));
  assert.ok(!wordAnswers.includes('photo'));
  assert.ok(content.items.find(item => item.en === 'My hobby is gardening.'));
  assert.ok(content.items.find(item => item.en === 'My hobby is taking photos.'));
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
  assert.ok(g7U1WritingRegistry.every(lesson => lesson.expectedTimeMinutes >= 15 && lesson.expectedTimeMinutes <= 20));
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
    assert.ok(content.items.filter(item => item.stage === 'word').length > 3, `${descriptor.id} final must prepare paragraph vocabulary`);
    assert.ok(wordCount >= 40, `${descriptor.id} paragraph too short: ${wordCount}`);
    assert.ok(wordCount <= 60, `${descriptor.id} paragraph too short: ${wordCount}`);
  }
});
