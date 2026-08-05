import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, expectedResponseDisplay, questionPromptDisplay, questionTypeForItem } from '../src/core/questionTypes.js';

test('legacy items default to typing without changing their dataset', () => {
  const item = { vi: 'làm vườn', en: 'gardening' };
  assert.equal(questionTypeForItem(item), 'typing');
  assert.equal(evaluateQuestion(item, 'gardening').correct, true);
  assert.equal(questionPromptDisplay(item), 'làm vườn');
  assert.equal(expectedResponseDisplay(item), 'gardening');
});

test('MCQ evaluates by stable choice id but reports choice text', () => {
  const item = {
    type: 'mcq',
    prompt: 'Choose',
    choices: [{ id: 'a', text: 'gardening' }, { id: 'b', text: 'drawing' }],
    correctChoiceId: 'a'
  };
  assert.deepEqual(evaluateQuestion(item, 'a'), { correct: true, normalizedResponse: 'a', displayResponse: 'gardening' });
  assert.equal(evaluateQuestion(item, 'b').correct, false);
  assert.equal(expectedResponseDisplay(item), 'gardening');
});

test('True/False accepts booleans and normalized string booleans', () => {
  const item = { type: 'true_false', statement: 'relax = thư giãn', answer: true };
  assert.equal(evaluateQuestion(item, true).correct, true);
  assert.equal(evaluateQuestion(item, 'true').displayResponse, 'TRUE');
  assert.equal(evaluateQuestion(item, false).correct, false);
  assert.equal(expectedResponseDisplay(item), 'TRUE');
});

test('Sentence Order requires exact token order and preserves punctuation', () => {
  const item = {
    type: 'sentence_order',
    prompt: 'Order',
    correctOrder: ['I', 'like', 'gardening.']
  };
  assert.equal(evaluateQuestion(item, ['I', 'like', 'gardening.']).correct, true);
  assert.equal(evaluateQuestion(item, ['I', 'gardening.', 'like']).correct, false);
  assert.equal(expectedResponseDisplay(item), 'I like gardening.');
});
