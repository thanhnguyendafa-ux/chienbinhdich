import test from 'node:test';
import assert from 'node:assert/strict';
import { coldWritingTokens, unknownWritingTokens } from '../src/data/writing-lexical-scaffold.js';
import { g6U1WritingScaffold } from '../src/data/g6-u1-writing-lexicon.js';
import { g7U1WritingScaffold } from '../src/data/g7-u1-writing-lexicon.js';
import { g6U1WritingRegistry } from '../src/data/g6-u1-writing-typing-catalog.js';
import { getG6U1WritingTypingContent } from '../src/data/g6-u1-writing-typing-content.js';
import { g7U1WritingRegistry } from '../src/data/g7-u1-writing-typing-catalog.js';
import { getG7U1WritingTypingContent } from '../src/data/g7-u1-writing-typing-content.js';

function audit(registry, prefix, getContent, scaffold) {
  const counts = {};
  const unknownByLesson = {};
  const coldByLesson = {};

  for (const descriptor of registry) {
    const key = descriptor.id.replace(prefix, '');
    const content = getContent(key);
    counts[key] = content.items.length;
    const words = content.items.filter(item => item.stage === 'word').map(item => [item.vi, item.en]);
    const phrases = content.items.filter(item => item.stage === 'phrase').map(item => [item.vi, item.en]);
    const sentences = content.items.filter(item => item.stage === 'sentence').map(item => [item.vi, item.en]);
    const unknown = unknownWritingTokens(phrases, sentences, scaffold);
    const cold = coldWritingTokens(words, phrases, sentences, scaffold);
    if (unknown.length) unknownByLesson[key] = unknown;
    if (cold.length) coldByLesson[key] = cold;
  }

  return { counts, unknownByLesson, coldByLesson };
}

test('G6/G7 writing lexical scaffold exposes audit counts and has no cold supported vocabulary', () => {
  const g6 = audit(g6U1WritingRegistry, 'g6-u1-writing-', getG6U1WritingTypingContent, g6U1WritingScaffold);
  const g7 = audit(g7U1WritingRegistry, 'g7-u1-writing-', getG7U1WritingTypingContent, g7U1WritingScaffold);

  console.log(`G6_SCAFFOLD_COUNTS=${JSON.stringify(g6.counts)}`);
  console.log(`G7_SCAFFOLD_COUNTS=${JSON.stringify(g7.counts)}`);
  console.log(`G6_UNKNOWN_TOKENS=${JSON.stringify(g6.unknownByLesson)}`);
  console.log(`G7_UNKNOWN_TOKENS=${JSON.stringify(g7.unknownByLesson)}`);
  console.log(`G6_COLD_TOKENS=${JSON.stringify(g6.coldByLesson)}`);
  console.log(`G7_COLD_TOKENS=${JSON.stringify(g7.coldByLesson)}`);

  assert.deepEqual(g6.unknownByLesson, {});
  assert.deepEqual(g7.unknownByLesson, {});
  assert.deepEqual(g6.coldByLesson, {});
  assert.deepEqual(g7.coldByLesson, {});
});
