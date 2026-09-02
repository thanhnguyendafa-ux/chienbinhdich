import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, expectedResponseDisplay } from '../src/core/questionTypes.js';
import { buildTypingErrorMap, isTypingSeparator } from '../src/core/typingErrorMap.js';
import { renderTypingErrorMapFeedback } from '../src/features/drill/typingErrorMapRenderer.js';

function typingItem(overrides = {}) {
  return Object.freeze({
    id: 'typing-separator-test',
    type: 'typing',
    en: 'new school',
    typingSeparatorTolerance: true,
    typingErrorMap: true,
    ...overrides
  });
}

test('separator tolerance is opt-in while case and letter accuracy stay strict', () => {
  const strict = Object.freeze({ id: 'strict-typing', type: 'typing', en: 'new school' });
  assert.equal(evaluateQuestion(strict, 'newschool').correct, false);

  const tolerant = typingItem();
  assert.equal(expectedResponseDisplay(tolerant), 'new school');
  assert.equal(evaluateQuestion(tolerant, 'new school').correct, true);
  assert.equal(evaluateQuestion(tolerant, 'newschool').correct, true);
  assert.equal(evaluateQuestion(tolerant, 'new   school').correct, true);
  assert.equal(evaluateQuestion(tolerant, 'new-school').correct, true);
  assert.equal(evaluateQuestion(tolerant, 'Newschool').correct, false);
  assert.equal(evaluateQuestion(tolerant, 'newscholl').correct, false);
});

test('separator tolerance accepts missing spaces, hyphens and question marks in combination', () => {
  const hyphenated = typingItem({ id: 'separator-hyphen-test', en: 'after-school club' });
  assert.equal(evaluateQuestion(hyphenated, 'afterschool club').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'after-schoolclub').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'afterschoolclub').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'after–schoolclub').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'afterscholclub').correct, false);

  const question = typingItem({ id: 'separator-question-test', en: 'How are you?' });
  assert.equal(evaluateQuestion(question, 'How are you').correct, true);
  assert.equal(evaluateQuestion(question, 'Howareyou?').correct, true);
  assert.equal(evaluateQuestion(question, 'Howareyou').correct, true);
  assert.equal(evaluateQuestion(question, 'How are yuo').correct, false);
  assert.equal(evaluateQuestion(question, 'howareyou').correct, false);
});

test('typing error map marks real letter mistakes but never tolerated separators', () => {
  const item = typingItem({ id: 'error-map-question', en: 'How are you?' });
  const map = buildTypingErrorMap(item, 'How are yuo');
  assert.equal(map.expected, 'How are you?');
  assert.ok(map.mistakeCount > 0);
  assert.ok([...map.enteredTokens, ...map.expectedTokens].some(token => token.status !== 'correct' && token.text !== '□'));
  for (const token of [...map.enteredTokens, ...map.expectedTokens]) {
    if (isTypingSeparator(token.text)) assert.equal(token.status, 'correct');
  }

  const separatorOnly = buildTypingErrorMap(typingItem({ id: 'error-map-hyphen', en: 'after-school club' }), 'afterschoolclub');
  assert.equal(separatorOnly.mistakeCount, 0);
  assert.ok([...separatorOnly.enteredTokens, ...separatorOnly.expectedTokens].every(token => token.status === 'correct'));
});

test('typing error map keeps the displayed canonical answer clean', () => {
  const item = typingItem();
  const map = buildTypingErrorMap(item, 'new schol');
  assert.equal(map.expected, 'new school');
  assert.equal(map.mistakeCount, 1);
  assert.ok(map.enteredTokens.some(token => token.status === 'missing' && token.text === '□'));
  assert.ok(map.expectedTokens.some(token => token.status === 'incorrect' && token.text === 'o'));

  const html = renderTypingErrorMapFeedback({
    feedback: { type: 'incorrect_reveal', entered: 'new schol', attemptNumber: 1 },
    item,
    masteryMessage: 'Mastery không đổi',
    esc: value => String(value)
  });
  assert.match(html, /Nhìn chỗ đỏ rồi sửa lại/);
  assert.match(html, /Con đã gõ/);
  assert.match(html, /Đáp án đúng/);
  assert.match(html, /typing-diff-correct/);
  assert.match(html, /typing-diff-(?:incorrect|missing)/);
  assert.equal(canonicalAnswerText(html), 'new school');
  assert.doesNotMatch(canonicalAnswerMarkup(html), /□/u);
});

function canonicalAnswerMarkup(html) {
  const match = String(html).match(/<span class="typing-error-row-label">Đáp án đúng<\/span>\s*<code class="typing-diff-text">([\s\S]*?)<\/code>/u);
  assert.ok(match, 'canonical answer row must render');
  return match[1];
}

function canonicalAnswerText(html) {
  return canonicalAnswerMarkup(html).replace(/<[^>]+>/gu, '');
}
