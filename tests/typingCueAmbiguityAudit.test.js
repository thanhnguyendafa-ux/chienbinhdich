import test from 'node:test';
import assert from 'node:assert/strict';
import { g6U1WritingRegistry } from '../src/data/g6-u1-writing-typing-published.js';
import { getG6U1WritingTypingContent } from '../src/data/g6-u1-writing-typing-content.js';
import { g7U1WritingRegistry } from '../src/data/g7-u1-writing-typing-published.js';
import { getG7U1WritingTypingContent } from '../src/data/g7-u1-writing-typing-content.js';
import * as g2Translation from '../src/data/g2-u6-translation-content.js';
import { global7Unit1Set1Content } from '../src/data/global7-unit1-set1.js';

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase('vi').replace(/\s+/g, ' ');
}

function generatedTypingLessons() {
  const lessons = [];
  for (const descriptor of g6U1WritingRegistry) {
    const key = descriptor.id.replace('g6-u1-writing-', '');
    lessons.push([descriptor.id, getG6U1WritingTypingContent(key)]);
  }
  for (const descriptor of g7U1WritingRegistry) {
    const key = descriptor.id.replace('g7-u1-writing-', '');
    lessons.push([descriptor.id, getG7U1WritingTypingContent(key)]);
  }
  for (const [name, content] of Object.entries(g2Translation)) {
    if (/^g2U6Translation\d+Content$/.test(name)) lessons.push([name, content]);
  }
  lessons.push(['global7Unit1Set1Content', global7Unit1Set1Content]);
  return lessons;
}

function ambiguousWordCues(label, content) {
  const byCue = new Map();
  for (const item of content.items.filter(item => item.stage === 'word')) {
    const cue = normalize(item.vi);
    if (!byCue.has(cue)) byCue.set(cue, new Set());
    byCue.get(cue).add(String(item.en ?? '').trim());
  }
  return [...byCue.entries()]
    .filter(([, answers]) => answers.size > 1)
    .map(([cue, answers]) => `${label}: "${cue}" -> ${[...answers].map(answer => `"${answer}"`).join(' | ')}`);
}

test('Typing WORD prompts are unambiguous inside each lesson', () => {
  const conflicts = generatedTypingLessons().flatMap(([label, content]) => ambiguousWordCues(label, content));
  if (conflicts.length) console.error(`AMBIGUOUS_TYPING_WORD_CUES=\n${conflicts.join('\n')}`);
  assert.deepEqual(conflicts, []);
});
