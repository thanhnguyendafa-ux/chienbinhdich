import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion } from '../src/core/questionTypes.js';
import { global5Unit1Writing01Content } from '../src/data/g5-u1-writing-01.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

test('Global 5 Unit 1 Writing 1 publishes 14 Select + Order questions with intentional distractors', async () => {
  const descriptor = getSetDescriptorBySlug('g5u1-writing-1');
  assert.equal(descriptor.id, 'g5-u1-writing-01');
  assert.equal(descriptor.itemCount, 14);
  assert.deepEqual(descriptor.activityTypes, ['sentence_order']);

  const set = await loadLessonSet(descriptor.id);
  assert.equal(set.items.length, 14);
  assert.deepEqual(validateSet(set), []);

  for (const item of set.items) {
    assert.equal(item.type, 'sentence_order');
    assert.ok(item.tokens.length > item.correctOrder.length);
    assert.ok((item.orderDiagnostics?.distractors ?? []).length >= 2);
    assert.ok(item.teachingFeedback?.reason);
    for (const accepted of item.acceptedOrders) {
      assert.equal(evaluateQuestion(item, accepted).correct, true, `${item.id} should accept ${accepted.join(' ')}`);
    }
    for (const distractor of item.orderDiagnostics.distractors) {
      assert.equal(item.acceptedOrders.some(order => order.includes(distractor.token)), false);
    }
  }
});

test('Writing content keeps the four source sentences and accepts full forms where contractions are valid', () => {
  const items = global5Unit1Writing01Content.items;
  assert.equal(items[0].correctOrder.join(' '), 'Can you tell me about yourself?');
  assert.equal(items[1].correctOrder.join(' '), 'I live in the countryside.');
  assert.equal(items[2].correctOrder.join(' '), "What's your favourite colour?");
  assert.equal(items[3].correctOrder.join(' '), 'I love playing table tennis.');

  const colour = items.find(item => item.id === 'g5u1-writing-q03');
  assert.equal(evaluateQuestion(colour, ['What', 'is', 'your', 'favourite colour?']).correct, true);

  const classItem = items.find(item => item.id === 'g5u1-writing-q05');
  assert.equal(evaluateQuestion(classItem, ['I', 'am', 'in', 'Class 5A.']).correct, true);
});
