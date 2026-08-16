import test from 'node:test';
import assert from 'node:assert/strict';
import { global5Unit1Reading01Content } from '../src/data/g5-u1-reading-01.js';

function wordCount(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

test('G5 U1 reading MCQ choices stay length-balanced', () => {
  const items = global5Unit1Reading01Content.items.filter(item => item.type === 'mcq');
  assert.equal(items.length, 15);

  for (const item of items) {
    assert.equal(item.choices.length, 4, `${item.id} should have four choices`);

    const lengths = item.choices.map(choice => wordCount(choice.text));
    const maxLength = Math.max(...lengths);
    const minLength = Math.min(...lengths);
    const correctIndex = item.choices.findIndex(choice => choice.id === item.correctChoiceId);

    assert.notEqual(correctIndex, -1, `${item.id} should have a valid correctChoiceId`);
    assert.ok(
      maxLength - minLength <= 2,
      `${item.id} answer lengths are too far apart: ${lengths.join(', ')}`
    );

    const correctLength = lengths[correctIndex];
    const longestCount = lengths.filter(length => length === maxLength).length;
    assert.ok(
      correctLength < maxLength || longestCount > 1,
      `${item.id} makes the correct answer uniquely longest: ${lengths.join(', ')}`
    );
  }
});
