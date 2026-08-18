import test from 'node:test';
import assert from 'node:assert/strict';
import { g5U1WritingSource } from '../src/data/g5-u1-writing-source.js';
import { g5U1WritingRegistry } from '../src/data/g5-u1-writing-typing-catalog.js';
import { getG5U1WritingTypingContent } from '../src/data/g5-u1-writing-typing-content.js';

const tokenize = value => String(value)
  .toLocaleLowerCase('en')
  .replace(/[’‘]/g, "'")
  .replace(/[^a-z0-9']+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean);

test('G5 U1 Writing Typing publishes exactly 14 one-target lessons', () => {
  assert.equal(g5U1WritingSource.length, 14);
  assert.equal(g5U1WritingRegistry.length, 14);
  assert.equal(new Set(g5U1WritingRegistry.map(item => item.lessonSlug)).size, 14);
});

test('each G5 U1 typing lesson has time metadata, safe title and exactly one matching FINAL', () => {
  for (const descriptor of g5U1WritingRegistry) {
    assert.ok(Number.isInteger(descriptor.expectedTimeMinutes));
    assert.ok(descriptor.expectedTimeMinutes >= 6 && descriptor.expectedTimeMinutes <= 7);
    assert.equal(descriptor.activityTypes[0], 'typing');
    assert.equal(descriptor.completionPolicy, 'all-items');

    const key = descriptor.id.replace('g5-u1-writing-typing-', '');
    const content = getG5U1WritingTypingContent(key);
    const source = g5U1WritingSource.find(item => item.id === descriptor.targetSentenceId);
    assert.ok(source);
    assert.equal(descriptor.title.includes(source.targetSentence), false, `title leaks target in ${key}`);

    const finals = content.items.filter(item => item.scaffoldRole === 'final');
    assert.equal(finals.length, 1, `lesson ${key} must have one FINAL`);
    assert.equal(finals[0].en, source.targetSentence);
    assert.equal(finals[0].vi, source.targetVi);
  }
});

test('cold-start coverage: every FINAL token is exposed before FINAL in its own lesson', () => {
  for (const source of g5U1WritingSource) {
    const key = String(source.order).padStart(2, '0');
    const content = getG5U1WritingTypingContent(key);
    const finalIndex = content.items.findIndex(item => item.scaffoldRole === 'final');
    assert.ok(finalIndex > 0, `lesson ${key} missing pre-final scaffold`);

    const exposed = new Set(tokenize(content.items.slice(0, finalIndex).map(item => item.en).join(' ')));
    const finalTokens = tokenize(source.targetSentence);
    for (const token of finalTokens) {
      assert.ok(exposed.has(token), `lesson ${key} introduces '${token}' only at FINAL`);
    }
  }
});

test('article, contraction and V-ing traps are explicitly pre-taught locally', () => {
  const checks = {
    '02': 'in the countryside',
    '03': "What's",
    '04': 'playing',
    '05': "I'm",
    '06': 'in the city',
    '10': 'a sandwich',
    '12': 'a dolphin',
    '13': 'playing'
  };
  for (const [key, expected] of Object.entries(checks)) {
    const items = getG5U1WritingTypingContent(key).items;
    const finalIndex = items.findIndex(item => item.scaffoldRole === 'final');
    assert.ok(items.slice(0, finalIndex).some(item => item.en === expected), `${key} must pre-teach ${expected}`);
  }
});
