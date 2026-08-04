import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAnswer, normalizeAnswer } from '../src/core/answerEvaluator.js';

test('normalize trims and collapses spaces only', () => assert.equal(normalizeAnswer('  help   me relax  '), 'help me relax'));

test('evaluation stays strict for case and punctuation', () => {
  assert.equal(evaluateAnswer('I like gardening.', 'I like gardening.').correct, true);
  assert.equal(evaluateAnswer('i like gardening.', 'I like gardening.').correct, false);
  assert.equal(evaluateAnswer('I like gardening', 'I like gardening.').correct, false);
});
