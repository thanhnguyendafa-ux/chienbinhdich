import test from 'node:test';
import assert from 'node:assert/strict';
import { g6U1WritingRegistry } from '../src/data/g6-u1-writing-typing-published.js';
import { getG6U1WritingTypingContent } from '../src/data/g6-u1-writing-typing-content.js';
import { g7U1WritingRegistry } from '../src/data/g7-u1-writing-typing-published.js';
import { getG7U1WritingTypingContent } from '../src/data/g7-u1-writing-typing-content.js';
import * as g2Translation from '../src/data/g2-u6-translation-content.js';
import { global7Unit1Set1Content } from '../src/data/global7-unit1-set1.js';

function words(value) {
  return String(value ?? '')
    .toLocaleLowerCase('en')
    .replace(/[’]/g, "'")
    .match(/[a-z]+(?:'[a-z]+)?|\d+/g) ?? [];
}

function containsSequence(target, phrase) {
  const targetWords = words(target);
  const phraseWords = words(phrase);
  if (!phraseWords.length || phraseWords.length > targetWords.length) return false;
  for (let start = 0; start <= targetWords.length - phraseWords.length; start += 1) {
    if (phraseWords.every((word, offset) => targetWords[start + offset] === word)) return true;
  }
  return false;
}

function assertSurfaceContract(label, content) {
  const wordItems = content.items.filter(item => item.stage === 'word');
  const downstream = content.items.filter(item => item.stage === 'phrase' || item.stage === 'sentence');
  assert.ok(wordItems.length > 0, `${label} must expose WORD scaffold items`);
  assert.ok(downstream.length > 0, `${label} must expose downstream PHRASE/SENTENCE items`);

  for (const item of wordItems) {
    assert.ok(
      downstream.some(target => containsSequence(target.en, item.en)),
      `${label}: WORD "${item.en}" must appear in the same surface form in a downstream PHRASE/SENTENCE`
    );
  }
}

test('all published G6/G7 Writing Typing lessons obey the exact surface-form scaffold contract', () => {
  for (const descriptor of g6U1WritingRegistry) {
    const key = descriptor.id.replace('g6-u1-writing-', '');
    assertSurfaceContract(descriptor.id, getG6U1WritingTypingContent(key));
  }
  for (const descriptor of g7U1WritingRegistry) {
    const key = descriptor.id.replace('g7-u1-writing-', '');
    assertSurfaceContract(descriptor.id, getG7U1WritingTypingContent(key));
  }
});

test('other Việt → Anh Typing lessons keep learner-facing words exactly as used downstream', () => {
  const g2Lessons = Object.entries(g2Translation)
    .filter(([name]) => /^g2U6Translation\d+Content$/.test(name));
  assert.equal(g2Lessons.length, 9);
  for (const [name, content] of g2Lessons) assertSurfaceContract(name, content);
  assertSurfaceContract('global7Unit1Set1Content', global7Unit1Set1Content);
});

test('surface-form regressions cover plural, V-ing, past and third-person forms', () => {
  const g7Identity = getG7U1WritingTypingContent('s1-01').items.filter(item => item.stage === 'word').map(item => item.en.toLowerCase());
  assert.ok(g7Identity.includes('gardening'));
  assert.ok(g7Identity.includes('taking'));
  assert.ok(g7Identity.includes('photos'));
  assert.ok(!g7Identity.includes('garden'));
  assert.ok(!g7Identity.includes('take'));
  assert.ok(!g7Identity.includes('photo'));

  const g7Past = getG7U1WritingTypingContent('s4-01').items.filter(item => item.stage === 'word').map(item => item.en.toLowerCase());
  assert.ok(g7Past.includes('started'));
  assert.ok(!g7Past.includes('start'));

  const g7Irregular = getG7U1WritingTypingContent('s4-03').items.filter(item => item.stage === 'word').map(item => item.en.toLowerCase());
  assert.ok(g7Irregular.includes('began'));
  assert.ok(!g7Irregular.includes('begin'));

  const g7ThirdPerson = getG7U1WritingTypingContent('s9-01').items.filter(item => item.stage === 'word').map(item => item.en.toLowerCase());
  assert.ok(g7ThirdPerson.includes('enjoys'));
  assert.ok(!g7ThirdPerson.includes('enjoy'));

  const g6Plural = getG6U1WritingTypingContent('s3-01').items.filter(item => item.stage === 'word').map(item => item.en.toLowerCase());
  assert.ok(g6Plural.includes('classes'));
  assert.ok(g6Plural.includes('students'));
  assert.ok(g6Plural.includes('classrooms'));
  assert.ok(!g6Plural.includes('class'));
  assert.ok(!g6Plural.includes('student'));
  assert.ok(!g6Plural.includes('classroom'));
});
