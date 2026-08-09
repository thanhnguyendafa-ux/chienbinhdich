import test from 'node:test';
import assert from 'node:assert/strict';
import { global5Unit1Reading01Content } from '../src/data/g5-u1-reading-01.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor, loadLessonSet } from '../src/repositories/lessonRepository.js';

const content = global5Unit1Reading01Content;

test('Global Success 5 Unit 1 Reading 1 keeps the approved 3 passage × 5 question blueprint', () => {
  assert.equal(content.passages.length, 3);
  assert.equal(content.items.length, 15);
  assert.equal(new Set(content.passages.map(passage => passage.id)).size, 3);
  assert.equal(new Set(content.items.map(item => item.id)).size, 15);
  for (const passage of content.passages) {
    assert.equal(content.items.filter(item => item.passageId === passage.id).length, 5);
  }
});

test('every reading question uses four diagnostic quadrants with one fully correct choice', () => {
  for (const item of content.items) {
    assert.equal(item.type, 'mcq');
    assert.equal(item.choices.length, 4);
    const quadrants = item.choices.map(choice => `${choice.diagnostic.verdictCorrect}:${choice.diagnostic.reasonCorrect}`);
    assert.deepEqual(new Set(quadrants), new Set(['true:true', 'true:false', 'false:true', 'false:false']));
    const correct = item.choices.find(choice => choice.id === item.correctChoiceId);
    assert.equal(correct.diagnostic.verdictCorrect, true);
    assert.equal(correct.diagnostic.reasonCorrect, true);
    assert.equal(item.choices.filter(choice => choice.diagnostic.verdictCorrect && choice.diagnostic.reasonCorrect).length, 1);
    assert.equal(item.choices.filter(choice => !(choice.diagnostic.verdictCorrect && choice.diagnostic.reasonCorrect)).every(choice => Boolean(choice.diagnostic.errorCode)), true);
  }
});

test('Reading 1 is catalogued as all-items MCQ with 80 mastery and loader preserves passages', async () => {
  const descriptor = getSetDescriptor('g5-u1-reading-01');
  assert.equal(descriptor.course, 'Global Success 5');
  assert.equal(descriptor.unit, 'Unit 1 · All about me!');
  assert.equal(descriptor.lessonSlug, 'g5u1-reading-1');
  assert.equal(descriptor.passThreshold, 80);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.deepEqual(descriptor.activityTypes, ['mcq']);
  assert.equal(descriptor.itemCount, 15);

  const set = await loadLessonSet(descriptor.id);
  assert.equal(set.passages.length, 3);
  assert.deepEqual(validateSet(set), []);
});

test('Reading 1 keeps Unit 1 language targets and deliberate contrast traps', () => {
  const text = [
    ...content.passages.map(passage => passage.text),
    ...content.items.flatMap(item => [item.prompt, ...item.choices.map(choice => choice.text)])
  ].join(' ').toLowerCase();
  for (const token of ['village', 'city', 'class', 'favourite', 'colour', 'food', 'sport', 'dolphin', 'sandwich', 'table tennis']) {
    assert.match(text, new RegExp(token));
  }
  for (const contrast of ['like', 'favourite', 'live', 'visiting', 'can play', 'because']) {
    assert.match(text, new RegExp(contrast));
  }
});
