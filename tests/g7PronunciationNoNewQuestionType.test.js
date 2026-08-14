import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_QUESTION_TYPES } from '../src/core/questionTypes.js';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

test('pronunciation lesson uses only existing question types', () => {
  for (const item of global7Unit1Pronunciation01Content.items) assert.ok(SUPPORTED_QUESTION_TYPES.includes(item.type));
});
