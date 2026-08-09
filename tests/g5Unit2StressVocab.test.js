import test from 'node:test';
import assert from 'node:assert/strict';
import { global5Unit2StressVocab01Content } from '../src/data/g5-u2-stress-vocab-01.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor, loadLessonSet } from '../src/repositories/lessonRepository.js';

const items = global5Unit2StressVocab01Content.items;

test('Global 5 Unit 2 Stress & Vocabulary publishes the approved 12-question mix', () => {
  assert.equal(items.length, 12);
  const counts = items.reduce((output, item) => {
    output[item.type] = (output[item.type] ?? 0) + 1;
    return output;
  }, {});
  assert.deepEqual(counts, { mcq: 7, true_false: 3, classification: 2 });
  assert.deepEqual(validateSet({ id: 'g5-u2-stress-vocab-01', passThreshold: 80, items }), []);
});

test('Unit 2 stress questions lock the -teen versus -ty contrast and both classifications stay at six tokens', () => {
  assert.equal(items[0].correctChoiceId, 'b');
  assert.equal(items[0].choices.find(choice => choice.id === 'b').text, 'sixteen');
  assert.equal(items[1].choices.find(choice => choice.id === items[1].correctChoiceId).text, 'fifteen');
  assert.equal(items[2].answer, true);

  const stressClassification = items[3];
  assert.equal(stressClassification.type, 'classification');
  assert.equal(stressClassification.tokens.length, 6);
  assert.deepEqual(
    stressClassification.tokens.filter(token => token.correctGroupId === 'stress-1').map(token => token.text),
    ['thirty', 'forty', 'eighty']
  );
  assert.deepEqual(
    stressClassification.tokens.filter(token => token.correctGroupId === 'stress-2').map(token => token.text),
    ['thirteen', 'fourteen', 'eighteen']
  );

  const vocabularyClassification = items[11];
  assert.equal(vocabularyClassification.tokens.length, 6);
  assert.deepEqual(
    vocabularyClassification.tokens.filter(token => token.correctGroupId === 'address-word').map(token => token.text),
    ['street', 'road']
  );
});

test('Unit 2 vocabulary targets homes, addresses and distance with complete teaching feedback', () => {
  const expectedTerms = ['address', 'flat', 'tower', 'house', 'Street', 'far from'];
  const source = JSON.stringify(items);
  for (const term of expectedTerms) assert.ok(source.includes(term), `Missing Unit 2 term: ${term}`);
  for (const item of items) {
    assert.ok(item.teachingFeedback?.correctLabel);
    assert.ok(item.teachingFeedback?.reason);
    assert.ok(item.teachingFeedback?.theory);
    assert.ok(item.teachingFeedback?.example);
  }
});

test('Unit 2 lesson is catalogued as all-items mixed practice with stable fixed slug', async () => {
  const descriptor = getSetDescriptor('g5-u2-stress-vocab-01');
  assert.equal(descriptor.folderId, 'global5-unit2');
  assert.equal(descriptor.lessonSlug, 'g5u2-trong-am-tu-vung-1');
  assert.equal(descriptor.passThreshold, 80);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.deepEqual(descriptor.activityTypes, ['mcq', 'true_false', 'classification']);
  assert.equal(descriptor.itemCount, 12);

  const set = await loadLessonSet(descriptor.id);
  assert.equal(set.items.length, 12);
  assert.deepEqual(validateSet(set), []);
});
