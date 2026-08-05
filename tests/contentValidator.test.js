import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const global7Unit1Set1 = await loadLessonSet('g7-u1-s1');

test('Global 7 Unit 1 Set 1 dependency order is valid', () => {
  assert.deepEqual(validateSet(global7Unit1Set1), []);
  assert.equal(global7Unit1Set1.items.length, 16);
  assert.deepEqual(global7Unit1Set1.items.map(item => item.stage), [
    ...Array(7).fill('word'),
    ...Array(6).fill('phrase'),
    ...Array(3).fill('sentence')
  ]);
});
