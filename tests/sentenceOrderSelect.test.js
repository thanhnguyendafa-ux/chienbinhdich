import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptedSentenceOrderDisplays,
  evaluateQuestion,
  sentenceOrderHasUnusedTokens,
  sentenceOrderMinimumLength
} from '../src/core/questionTypes.js';
import {
  deriveSentenceOrderDiagnostics,
  diagnoseSentenceOrder,
  sentenceOrderFeedbackHint
} from '../src/core/sentenceOrderDiagnostics.js';
import { validateSet } from '../src/data/contentValidator.js';

const colourQuestion = {
  id: 'colour',
  type: 'sentence_order',
  prompt: 'Hỏi về màu sắc yêu thích.',
  tokens: ["What's", 'What', 'is', 'your', 'favourite colour?', 'are', 'you'],
  correctOrder: ["What's", 'your', 'favourite colour?'],
  acceptedOrders: [
    ["What's", 'your', 'favourite colour?'],
    ['What', 'is', 'your', 'favourite colour?']
  ],
  orderDiagnostics: {
    distractors: [
      { token: 'are', code: 'wrong_auxiliary', hint: 'Use is.' },
      { token: 'you', code: 'wrong_possessive', hint: 'Use your.' }
    ],
    rules: [
      { code: 'double_auxiliary', hint: "What's already contains is.", all: ["What's", 'is'], none: [] },
      { code: 'missing_auxiliary', hint: 'What needs is.', all: ['What'], none: ['is', 'are', "What's"] }
    ]
  }
};

test('Select + Order accepts contraction and full-form alternatives', () => {
  assert.equal(evaluateQuestion(colourQuestion, ["What's", 'your', 'favourite colour?']).correct, true);
  assert.equal(evaluateQuestion(colourQuestion, ['What', 'is', 'your', 'favourite colour?']).correct, true);
  assert.equal(evaluateQuestion(colourQuestion, ["What's", 'is', 'your', 'favourite colour?']).correct, false);
  assert.equal(evaluateQuestion(colourQuestion, ['What', 'your', 'favourite colour?']).correct, false);
  assert.deepEqual(acceptedSentenceOrderDisplays(colourQuestion), [
    "What's your favourite colour?",
    'What is your favourite colour?'
  ]);
  assert.equal(sentenceOrderHasUnusedTokens(colourQuestion), true);
  assert.equal(sentenceOrderMinimumLength(colourQuestion), 3);
});

test('Select + Order diagnostics distinguish double auxiliary, missing auxiliary, distractor and wrong order', () => {
  assert.equal(diagnoseSentenceOrder(colourQuestion, ["What's", 'is', 'your', 'favourite colour?']).code, 'double_auxiliary');
  assert.equal(diagnoseSentenceOrder(colourQuestion, ['What', 'your', 'favourite colour?']).code, 'missing_auxiliary');
  assert.equal(diagnoseSentenceOrder(colourQuestion, ["What's", 'your', 'are', 'favourite colour?']).code, 'wrong_auxiliary');
  assert.equal(diagnoseSentenceOrder(colourQuestion, ['your', "What's", 'favourite colour?']).code, 'right_tokens_wrong_order');
  assert.match(sentenceOrderFeedbackHint(colourQuestion, "What's is your favourite colour?"), /already contains is/i);
});

test('content validator accepts superset token pools and rejects accepted answers outside the pool', () => {
  const validSet = { id: 'valid', passThreshold: 80, items: [colourQuestion] };
  assert.deepEqual(validateSet(validSet), []);

  const invalid = structuredClone(colourQuestion);
  invalid.id = 'invalid';
  invalid.acceptedOrders.push(['Where', 'is', 'your', 'favourite colour?']);
  const errors = validateSet({ id: 'invalid-set', passThreshold: 80, items: [invalid] });
  assert.ok(errors.some(error => error.includes('acceptedOrder dùng token ngoài token pool')));
});

test('legacy sentence_order remains single-answer and valid', () => {
  const legacy = {
    id: 'legacy',
    type: 'sentence_order',
    prompt: 'Sắp xếp thành câu đúng.',
    tokens: ['I', 'like', 'gardening.'],
    displayOrder: ['gardening.', 'I', 'like'],
    correctOrder: ['I', 'like', 'gardening.']
  };
  assert.equal(evaluateQuestion(legacy, ['I', 'like', 'gardening.']).correct, true);
  assert.equal(evaluateQuestion(legacy, ['like', 'I', 'gardening.']).correct, false);
  assert.equal(sentenceOrderHasUnusedTokens(legacy), false);
  assert.deepEqual(validateSet({ id: 'legacy-set', passThreshold: 80, items: [legacy] }), []);
});

test('Writing diagnostic summary counts only first main attempts', () => {
  const session = {
    attempts: [
      { itemId: 'colour', promptKind: 'main', attemptNumber: 1, submittedResponse: ['What', 'your', 'favourite colour?'] },
      { itemId: 'colour', promptKind: 'main', attemptNumber: 2, submittedResponse: ['What', 'is', 'your', 'favourite colour?'] },
      { itemId: 'colour', promptKind: 'retry', attemptNumber: 1, submittedResponse: ["What's", 'your', 'favourite colour?'] }
    ]
  };
  const summary = deriveSentenceOrderDiagnostics(session, { items: [colourQuestion] });
  assert.equal(summary.total, 1);
  assert.equal(summary.correct, 0);
  assert.equal(summary.byCode.missing_auxiliary, 1);
});
