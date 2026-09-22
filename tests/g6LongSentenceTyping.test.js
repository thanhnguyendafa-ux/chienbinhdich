import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U2LongSentenceTyping01Content } from '../src/data/g6-u2-long-sentence-typing-01.js';
import { g6U2LongSentenceTypingRegistry } from '../src/data/g6-u2-long-sentence-typing-catalog.js';
import { lessonRegistry as publishedRegistry } from '../src/data/publishedLessonCatalog.js';

const TARGET = 'My bedroom also has a big window and a clock on the wall.';

test('G6 long-sentence sample is strict 100% mastery and publicly registered', () => {
  const descriptor = g6U2LongSentenceTypingRegistry[0];
  assert.equal(descriptor.lessonSlug, 'g6u2-long-sentence-typing-01');
  assert.equal(descriptor.passThreshold, 100);
  assert.equal(descriptor.typingTolerance, false);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.equal(descriptor.itemCount, 13);
  assert.equal(publishedRegistry.filter(item => item.id === descriptor.id).length, 1);
  assert.deepEqual(validateSet({ ...descriptor, items: g6U2LongSentenceTyping01Content.items }), []);
});

test('target is previewed before the drill, then rebuilt from short overlapping chunks', () => {
  const { preLessonTheory, items } = g6U2LongSentenceTyping01Content;
  const theoryText = preLessonTheory.sections.flatMap(section => section.bullets).join(' ');
  assert.match(theoryText, /My bedroom also has a big window and a clock on the wall\./);
  assert.match(theoryText, /Phòng ngủ của tôi cũng có một cửa sổ lớn/);

  assert.deepEqual(items.slice(0, 5).map(item => item.en), [
    'my bedroom',
    'also has',
    'a big window',
    'a clock',
    'on the wall'
  ]);

  assert.ok(items.some(item => item.en === 'my bedroom also has'));
  assert.ok(items.some(item => item.en === 'also has a big window'));
  assert.ok(items.some(item => item.en === 'a big window and a clock'));
  assert.ok(items.some(item => item.en === 'a clock on the wall'));
  assert.equal(items.at(-1).en, TARGET);

  const normalizedTarget = TARGET.toLowerCase().replace(/[.?!]/g, '');
  for (const item of items.slice(0, -1)) {
    assert.ok(normalizedTarget.includes(item.en.toLowerCase()), `${item.id} must be a real contiguous chunk of the target`);
    assert.doesNotMatch(item.en, /[.?!]$/, `${item.id} must stay a chunk, not another full target sentence`);
  }
});
