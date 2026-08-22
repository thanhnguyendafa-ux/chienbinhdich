import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_QUESTION_TYPES } from '../src/core/questionTypes.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';
import { g6U3WorkbookRegistry } from '../src/data/g6-u3-workbook-catalog.js';
import { G6_WORKBOOK_PRELOAD_KEYS, getG6WorkbookPreloadSpec } from '../src/data/g6-workbook-preload-registry.js';

const registries = [g6U1WorkbookRegistry, g6U2WorkbookRegistry, g6U3WorkbookRegistry];

test('engine keeps six stable interaction primitives', () => {
  assert.deepEqual(SUPPORTED_QUESTION_TYPES, ['typing','mcq','true_false','sentence_order','sequence_number','classification']);
});

test('G6 workbook Units 1-3 preserve source interaction mix while adding MCQ translation preload', () => {
  const descriptors = registries.flat();
  assert.equal(descriptors.length, 44);
  const sourceTypes = new Set(descriptors.flatMap(descriptor => descriptor.sourceActivityTypes));
  for (const type of ['typing','mcq','sentence_order','sequence_number','classification']) assert.ok(sourceTypes.has(type), `missing source type ${type}`);
  const typingOnly = descriptors.filter(descriptor => descriptor.sourceActivityTypes.length === 1 && descriptor.sourceActivityTypes[0] === 'typing');
  assert.ok(typingOnly.length <= 15, `too many source typing-only lessons: ${typingOnly.length}`);
  assert.ok(descriptors.every(descriptor => descriptor.activityTypes.includes('mcq')), 'every lesson must expose translation MCQ preload');
  assert.ok(descriptors.every(descriptor => descriptor.preloadItemCount === 8), 'each lesson has 4 vocab + 4 phrase items');
});

test('all 44 G6 workbook lessons have four vocabulary and four phrase meanings', () => {
  assert.equal(G6_WORKBOOK_PRELOAD_KEYS.u1.length, 15);
  assert.equal(G6_WORKBOOK_PRELOAD_KEYS.u2.length, 14);
  assert.equal(G6_WORKBOOK_PRELOAD_KEYS.u3.length, 15);
  for (const [unitKey, registry] of [['u1',g6U1WorkbookRegistry],['u2',g6U2WorkbookRegistry],['u3',g6U3WorkbookRegistry]]) {
    for (const descriptor of registry) {
      const key = descriptor.id.split('-').at(-1);
      const spec = getG6WorkbookPreloadSpec(unitKey, key);
      assert.equal(spec?.vocab.length, 4, `${descriptor.id} vocab`);
      assert.equal(spec?.phrases.length, 4, `${descriptor.id} phrase`);
    }
  }
});

test('recall and word-search lessons do not preload their target answers', () => {
  const u1b3 = getG6WorkbookPreloadSpec('u1','b3');
  const u1Targets = new Set(['bench','coloured pencils','bike','bicycle','dictionary','notebook','calculator','library','poster']);
  for (const [english] of [...u1b3.vocab, ...u1b3.phrases]) assert.equal(u1Targets.has(english.toLowerCase()), false, `U1 B3 leaked ${english}`);

  const u3b2 = getG6WorkbookPreloadSpec('u3','b2');
  const u3Targets = new Set(['careful','creative','kind','loving','hard-working','hard working','shy']);
  for (const [english] of [...u3b2.vocab, ...u3b2.phrases]) assert.equal(u3Targets.has(english.toLowerCase()), false, `U3 B2 leaked ${english}`);

  const u2b2 = getG6WorkbookPreloadSpec('u2','b2');
  const hiddenWords = new Set(['lamp','sofa','bathroom','bedroom','hall','cupboard','kitchen','poster']);
  for (const [english] of [...u2b2.vocab,...u2b2.phrases]) assert.equal(hiddenWords.has(english.toLowerCase()),false,`U2 B2 leaked ${english}`);
});

test('representative source task mappings remain visible in sourceActivityTypes', () => {
  const descriptors = registries.flat();
  const map = new Map(descriptors.map(descriptor => [descriptor.id, descriptor.sourceActivityTypes]));
  assert.deepEqual(map.get('g6-u1-wb-b6'), ['sentence_order']);
  assert.deepEqual(map.get('g6-u1-wb-c2'), ['sentence_order']);
  assert.deepEqual(map.get('g6-u2-wb-b2'), ['classification']);
  assert.deepEqual(map.get('g6-u2-wb-c1'), ['sequence_number']);
  assert.deepEqual(map.get('g6-u2-wb-e1'), ['typing']);
  assert.deepEqual(map.get('g6-u2-wb-e3'), ['sentence_order']);
  assert.deepEqual(map.get('g6-u3-wb-d3'), ['classification']);
  assert.deepEqual(map.get('g6-u3-wb-e2'), ['classification']);
});
