import test from 'node:test';
import assert from 'node:assert/strict';
import { mcqChoiceFeedback } from '../src/core/mcqChoiceFeedback.js';

test('mcqChoiceFeedback resolves optional feedback by submitted choice text or id', () => {
  const item = {
    type: 'mcq',
    choices: [
      { id: 'a', text: 'smart', feedback: 'Thầy: Con xét lại từ loại.' },
      { id: 'b', text: 'library', feedback: 'Thầy: Con xét lại nơi chốn.' }
    ]
  };

  assert.equal(mcqChoiceFeedback(item, 'smart'), 'Thầy: Con xét lại từ loại.');
  assert.equal(mcqChoiceFeedback(item, 'b'), 'Thầy: Con xét lại nơi chốn.');
  assert.equal(mcqChoiceFeedback(item, 'unknown'), '');
});

test('mcqChoiceFeedback stays inert for existing MCQs without choice feedback', () => {
  assert.equal(mcqChoiceFeedback({ type: 'mcq', choices: [{ id: 'a', text: 'A' }] }, 'A'), '');
  assert.equal(mcqChoiceFeedback({ type: 'typing', choices: [{ id: 'a', text: 'A', feedback: 'No' }] }, 'A'), '');
  assert.equal(mcqChoiceFeedback(null, 'A'), '');
});
