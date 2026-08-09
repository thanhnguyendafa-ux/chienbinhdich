import test from 'node:test';
import assert from 'node:assert/strict';
import { global5Unit1Pattern01Content } from '../src/data/g5-u1-pattern-01.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor } from '../src/repositories/lessonRepository.js';

test('Global Success 5 Unit 1 sentence patterns lesson keeps the approved 17-item blueprint', () => {
  const items = global5Unit1Pattern01Content.items;
  assert.equal(items.length, 17);
  assert.equal(items.filter(item => item.type === 'mcq').length, 12);
  assert.equal(items.filter(item => item.type === 'true_false').length, 5);
  assert.equal(new Set(items.map(item => item.id)).size, 17);
  assert.equal(items.every(item => item.teachingFeedback?.reason && item.teachingFeedback?.theory && item.teachingFeedback?.example), true);
});

test('Global Success 5 Unit 1 sentence patterns stays on MCQ/True-False architecture with 80 mastery', () => {
  assert.deepEqual(validateSet({
    id: 'g5-u1-pattern-01',
    items: global5Unit1Pattern01Content.items,
    passThreshold: 80
  }), []);

  const descriptor = getSetDescriptor('g5-u1-pattern-01');
  assert.equal(descriptor.course, 'Global Success 5');
  assert.equal(descriptor.unit, 'Unit 1 · All about me!');
  assert.equal(descriptor.lessonSlug, 'g5u1-mau-cau-1');
  assert.equal(descriptor.passThreshold, 80);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.deepEqual(descriptor.activityTypes, ['mcq', 'true_false']);
  assert.equal(descriptor.itemCount, 17);
});

test('sentence pattern distractors stay inside Unit 1 personal-information and preference context', () => {
  const text = global5Unit1Pattern01Content.items.map(item => {
    if (item.type === 'mcq') return [item.prompt, ...item.choices.map(choice => choice.text)].join(' ');
    return item.statement;
  }).join(' ');

  for (const token of ['live', 'favourite', 'sport', 'food', 'colour', 'class', 'yourself', 'table tennis']) {
    assert.match(text.toLowerCase(), new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase()));
  }
  assert.doesNotMatch(text, /present perfect|relative clause|past perfect/i);
});
