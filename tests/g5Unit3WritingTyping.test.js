import test from 'node:test';
import assert from 'node:assert/strict';
import { g5U3WritingSource } from '../src/data/g5-u3-writing-source.js';
import { g5U3WritingFolders, g5U3WritingRegistry } from '../src/data/g5-u3-writing-typing-catalog.js';
import { getG5U3WritingTypingContent } from '../src/data/g5-u3-writing-typing-content.js';

const tokenize = value => String(value)
  .toLocaleLowerCase('en')
  .replace(/[’‘]/g, "'")
  .replace(/[^a-z0-9']+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean);

const normalize = value => String(value)
  .toLocaleLowerCase('en')
  .replace(/[’‘]/g, "'")
  .replace(/[^a-z0-9']+/g, ' ')
  .trim();

test('G5 U3 publishes 1 Quick Bank + exactly 18 one-target lessons', () => {
  assert.equal(g5U3WritingSource.length, 18);
  assert.equal(g5U3WritingRegistry.length, 19);
  assert.equal(g5U3WritingRegistry[0].lessonSlug, 'g5u3-writing-qb');
  assert.equal(new Set(g5U3WritingRegistry.map(item => item.lessonSlug)).size, 19);
  assert.deepEqual(
    g5U3WritingRegistry.slice(1).map(item => item.lessonSlug),
    Array.from({ length: 18 }, (_, index) => `g5u3-writing-${String(index + 1).padStart(2, '0')}`)
  );
});

test('G5 U3 folders include Unit root, sentence builder and six learner families', () => {
  assert.equal(g5U3WritingFolders.length, 8);
  assert.equal(g5U3WritingFolders.find(folder => folder.id === 'global5-unit3')?.parentId, 'global5');
  assert.equal(g5U3WritingFolders.filter(folder => folder.parentId === 'global5-unit3-writing-typing').length, 6);
});

test('Quick Bank has no FINAL; every main lesson has exactly one matching FINAL', () => {
  assert.equal(getG5U3WritingTypingContent('qb').items.some(item => item.scaffoldRole === 'final'), false);
  let totalMinutes = 0;
  for (const descriptor of g5U3WritingRegistry.slice(1)) {
    totalMinutes += descriptor.expectedTimeMinutes;
    assert.ok(descriptor.expectedTimeMinutes >= 5 && descriptor.expectedTimeMinutes <= 7);
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.equal(descriptor.typingTolerance, false);
    const key = descriptor.id.replace('g5-u3-writing-typing-', '');
    const content = getG5U3WritingTypingContent(key);
    const source = g5U3WritingSource.find(item => item.id === descriptor.targetSentenceId);
    const finals = content.items.filter(item => item.scaffoldRole === 'final');
    assert.equal(finals.length, 1, `lesson ${key} must have one FINAL`);
    assert.equal(finals[0].en, source.targetSentence);
    assert.equal(finals[0].vi, source.targetVi);
    assert.equal(descriptor.title.includes(source.targetSentence), false, `title leaks target in ${key}`);
  }
  assert.equal(totalMinutes, 113);
});

test('cold-start coverage: every FINAL token is exposed locally before FINAL', () => {
  for (const source of g5U3WritingSource) {
    const key = String(source.order).padStart(2, '0');
    const content = getG5U3WritingTypingContent(key);
    const finalIndex = content.items.findIndex(item => item.scaffoldRole === 'final');
    const exposed = new Set(tokenize(content.items.slice(0, finalIndex).map(item => item.en).join(' ')));
    for (const token of tokenize(source.targetSentence)) {
      assert.ok(exposed.has(token), `lesson ${key} introduces '${token}' only at FINAL`);
    }
  }
});

test('anti-answer-leak: no pre-final English item is the whole target or an >=80% target-token near-copy', () => {
  for (const source of g5U3WritingSource) {
    const key = String(source.order).padStart(2, '0');
    const content = getG5U3WritingTypingContent(key);
    const finalIndex = content.items.findIndex(item => item.scaffoldRole === 'final');
    const target = normalize(source.targetSentence);
    const targetTokens = new Set(tokenize(source.targetSentence));
    for (const item of content.items.slice(0, finalIndex)) {
      assert.notEqual(normalize(item.en), target, `lesson ${key} leaks full target in ${item.id}`);
      const itemTokens = new Set(tokenize(item.en));
      const covered = [...targetTokens].filter(token => itemTokens.has(token)).length;
      const ratio = targetTokens.size ? covered / targetTokens.size : 0;
      assert.ok(ratio < 0.8, `lesson ${key} has near-complete pre-final leak ${item.id}: ${item.en}`);
    }
  }
});

test('country/nationality, contraction, inversion and morphology gates are local', () => {
  const checks = {
    '02': ["Where's"],
    '03': ['Australia', "He's"],
    '04': ['what nationality', 'is he'],
    '05': ['Australia', 'Australian', "He's"],
    '06': ['what nationality', 'is she'],
    '07': ['Japan', 'Japanese', "She's"],
    '08': ["What's", 'like'],
    '11': ["What's", 'like'],
    '14': ['his friends', 'likes', 'helping'],
    '15': ['playing', "He's", 'badminton', 'now'],
    '16': ['quick', 'quickly', 'learns', 'things'],
    '17': ['she is', 'is she', 'active'],
    '18': ['yes', 'she', 'is']
  };
  for (const [key, expectedValues] of Object.entries(checks)) {
    const items = getG5U3WritingTypingContent(key).items;
    const finalIndex = items.findIndex(item => item.scaffoldRole === 'final');
    const preFinal = items.slice(0, finalIndex).map(item => item.en);
    for (const expected of expectedValues) {
      assert.ok(preFinal.includes(expected), `${key} must pre-teach ${expected}`);
    }
  }
});

test('student-facing ambiguity controls are present and unsafe cues are absent', () => {
  const l08 = getG5U3WritingTypingContent('08').items.map(item => item.vi).join(' ');
  const l11 = getG5U3WritingTypingContent('11').items.map(item => item.vi).join(' ');
  assert.match(l08, /tính cách|đặc điểm/);
  assert.match(l08, /sở thích/);
  assert.match(l11, /tính cách|đặc điểm/);
  assert.match(l11, /sở thích/);

  const serialized = JSON.stringify([
    ...g5U3WritingRegistry.map(item => ({ title: item.title, description: item.description })),
    ...Array.from({ length: 18 }, (_, index) => getG5U3WritingTypingContent(String(index + 1).padStart(2, '0')).items.map(item => item.vi))
  ]);
  assert.equal(serialized.includes('mọi thứ'), false);
  assert.equal(serialized.includes('rất hay giúp đỡ'), false);
});

test('Quick Bank covers all transcript nationality forms selected for exposure', () => {
  const english = getG5U3WritingTypingContent('qb').items.map(item => item.en);
  for (const value of ['Australia', 'Australian', 'Malaysia', 'Malaysian', 'America', 'American', 'Japan', 'Japanese', 'Britain', 'British']) {
    assert.ok(english.includes(value), `Quick Bank missing ${value}`);
  }
});
