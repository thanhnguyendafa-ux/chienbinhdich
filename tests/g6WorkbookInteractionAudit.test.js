import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_QUESTION_TYPES } from '../src/core/questionTypes.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';
import { g6U3WorkbookRegistry } from '../src/data/g6-u3-workbook-catalog.js';

const registries = [g6U1WorkbookRegistry, g6U2WorkbookRegistry, g6U3WorkbookRegistry];

test('engine keeps six stable interaction primitives', () => {
  assert.deepEqual(SUPPORTED_QUESTION_TYPES, [
    'typing',
    'mcq',
    'true_false',
    'sentence_order',
    'sequence_number',
    'classification'
  ]);
});

test('G6 workbook Units 1-3 use the engine mix instead of defaulting to typing', () => {
  const descriptors = registries.flat();
  assert.equal(descriptors.length, 41);

  const types = new Set(descriptors.flatMap(descriptor => descriptor.activityTypes));
  for (const type of ['typing','mcq','sentence_order','sequence_number','classification']) {
    assert.ok(types.has(type), `missing interaction type ${type}`);
  }

  const typingOnly = descriptors.filter(descriptor => descriptor.activityTypes.length === 1 && descriptor.activityTypes[0] === 'typing');
  assert.ok(typingOnly.length <= 14, `too many typing-only G6 workbook lessons: ${typingOnly.length}`);

  const taskMatched = new Map(descriptors.map(descriptor => [descriptor.id, descriptor.activityTypes]));
  assert.deepEqual(taskMatched.get('g6-u1-wb-b6'), ['sentence_order']);
  assert.deepEqual(taskMatched.get('g6-u2-wb-c1'), ['sequence_number']);
  assert.deepEqual(taskMatched.get('g6-u2-wb-e1'), ['sentence_order']);
  assert.deepEqual(taskMatched.get('g6-u3-wb-d3'), ['classification']);
  assert.deepEqual(taskMatched.get('g6-u3-wb-e2'), ['classification']);
});
