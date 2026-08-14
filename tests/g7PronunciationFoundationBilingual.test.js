import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Pronunciation01Content } from '../src/data/g7-u1-pronunciation-01.js';

const foundation = global7Unit1Pronunciation01Content.items.slice(0, 11);

test('foundation choices that use language labels are bilingual where needed', () => {
  const strongWeak = foundation.find(item => item.id === 'g7u1-pr-q03');
  assert.ok(strongWeak.choices.every(choice => choice.text.includes('/')));
  const statement = foundation.find(item => item.id === 'g7u1-pr-q08').statement;
  assert.match(statement, /Mọi/);
});
