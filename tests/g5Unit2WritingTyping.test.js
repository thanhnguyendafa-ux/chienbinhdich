import test from 'node:test';
import assert from 'node:assert/strict';
import { g5U2WritingSource } from '../src/data/g5-u2-writing-source.js';
import { g5U2WritingFolders, g5U2WritingRegistry } from '../src/data/g5-u2-writing-typing-catalog.js';
import { getG5U2WritingTypingContent } from '../src/data/g5-u2-writing-typing-content.js';

const tokenize = value => String(value)
  .toLocaleLowerCase('en')
  .replace(/[’‘]/g, "'")
  .replace(/[^a-z0-9']+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean);

test('G5 U2 Writing Typing publishes exactly 16 one-target lessons', () => {
  assert.equal(g5U2WritingSource.length, 16);
  assert.equal(g5U2WritingRegistry.length, 16);
  assert.equal(new Set(g5U2WritingRegistry.map(item => item.lessonSlug)).size, 16);
  assert.deepEqual(g5U2WritingRegistry.map(item => item.lessonSlug), Array.from({ length: 16 }, (_, index) => `g5u2-writing-${String(index + 1).padStart(2, '0')}`));
});

test('G5 U2 has five learner families under the sentence-builder folder', () => {
  assert.equal(g5U2WritingFolders.length, 6);
  assert.equal(g5U2WritingFolders.filter(folder => folder.parentId === 'global5-unit2-writing-typing').length, 5);
});

test('each G5 U2 typing lesson has time metadata, safe title and exactly one matching FINAL', () => {
  let totalMinutes = 0;
  for (const descriptor of g5U2WritingRegistry) {
    assert.ok(Number.isInteger(descriptor.expectedTimeMinutes));
    assert.ok(descriptor.expectedTimeMinutes >= 5 && descriptor.expectedTimeMinutes <= 7);
    totalMinutes += descriptor.expectedTimeMinutes;
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.equal(descriptor.typingTolerance, false);

    const key = descriptor.id.replace('g5-u2-writing-typing-', '');
    const content = getG5U2WritingTypingContent(key);
    const source = g5U2WritingSource.find(item => item.id === descriptor.targetSentenceId);
    assert.ok(source);
    assert.equal(descriptor.title.includes(source.targetSentence), false, `title leaks target in ${key}`);

    const finals = content.items.filter(item => item.scaffoldRole === 'final');
    assert.equal(finals.length, 1, `lesson ${key} must have one FINAL`);
    assert.equal(finals[0].en, source.targetSentence);
    assert.equal(finals[0].vi, source.targetVi);
  }
  assert.equal(totalMinutes, 97);
});

test('cold-start coverage: every FINAL token is exposed before FINAL in its own lesson', () => {
  for (const source of g5U2WritingSource) {
    const key = String(source.order).padStart(2, '0');
    const content = getG5U2WritingTypingContent(key);
    const finalIndex = content.items.findIndex(item => item.scaffoldRole === 'final');
    assert.ok(finalIndex > 0, `lesson ${key} missing pre-final scaffold`);

    const exposed = new Set(tokenize(content.items.slice(0, finalIndex).map(item => item.en).join(' ')));
    const finalTokens = tokenize(source.targetSentence);
    for (const token of finalTokens) {
      assert.ok(exposed.has(token), `lesson ${key} introduces '${token}' only at FINAL`);
    }
  }
});

test('articles, auxiliaries, contractions, morphology and address prepositions are pre-taught locally', () => {
  const checks = {
    '01': ['this house', 'Do you live in this house'],
    '03': ['that building', 'Do you live in that building'],
    '06': ['do not', "don't"],
    '09': ['a house', 'in a house'],
    '10': ['a flat', 'in a flat'],
    '11': ['the school', 'near the school'],
    '13': ['What is', "What's"],
    '14': ['It is', "It's"],
    '15': ['at', 'at 15 Ba Dinh Street'],
    '16': ['live', 'lives', 'at 16 London Street']
  };
  for (const [key, expectedValues] of Object.entries(checks)) {
    const items = getG5U2WritingTypingContent(key).items;
    const finalIndex = items.findIndex(item => item.scaffoldRole === 'final');
    const preFinal = items.slice(0, finalIndex).map(item => item.en);
    for (const expected of expectedValues) {
      assert.ok(preFinal.includes(expected), `${key} must pre-teach ${expected}`);
    }
  }
});

test('production source has no unresolved address placeholder and locks verified Ba Dinh Street', () => {
  const serialized = JSON.stringify(g5U2WritingSource);
  assert.equal(serialized.includes('[VERIFIED STREET]'), false);
  assert.equal(serialized.includes('TODO_ADDRESS'), false);
  const lesson15 = g5U2WritingSource.find(item => item.order === 15);
  assert.equal(lesson15.targetSentence, 'I live at 15 Ba Dinh Street.');
  assert.match(lesson15.sourceNote, /Ba Dinh Street/);
});
