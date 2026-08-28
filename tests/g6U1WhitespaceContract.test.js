import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, expectedResponseDisplay } from '../src/core/questionTypes.js';
import { g6U1VocabTypingRegistry } from '../src/data/g6-u1-vocab-typing-catalog.js';
import { renderTypingErrorMapFeedback } from '../src/features/drill/typingErrorMapRenderer.js';

const TOTAL_ITEMS = 193;

async function productionItems() {
  const groups = await Promise.all(g6U1VocabTypingRegistry.map(async descriptor => {
    const content = await descriptor.loadContent();
    return content.items;
  }));
  return groups.flat();
}

test('all 193 canonical answers keep normal surface spacing while production accepts missing or repeated spaces', async () => {
  const items = await productionItems();
  assert.equal(items.length, TOTAL_ITEMS);

  for (const item of items) {
    assert.equal(item.en, item.en.trim(), `${item.id}: canonical answer must not have edge whitespace`);
    assert.doesNotMatch(item.en, /\s{2,}/u, `${item.id}: canonical answer must use normal single spacing`);
    assert.equal(expectedResponseDisplay(item), item.en, `${item.id}: displayed answer must preserve canonical surface`);

    const withoutSpaces = item.en.replace(/\s+/gu, '');
    const repeatedSpaces = item.en.replace(/\s+/gu, '   ');
    const padded = `   ${item.en}   `;

    assert.equal(evaluateQuestion(item, withoutSpaces).correct, true, `${item.id}: missing spaces must be tolerated`);
    assert.equal(evaluateQuestion(item, repeatedSpaces).correct, true, `${item.id}: repeated spaces must be tolerated`);
    assert.equal(evaluateQuestion(item, padded).correct, true, `${item.id}: extra edge spaces must be tolerated`);
  }
});

test('new school and school remain distinct canonical answers despite whitespace tolerance', async () => {
  const content = await g6U1VocabTypingRegistry[0].loadContent();
  const newSchool = content.items.find(item => item.en === 'new school');
  const school = content.items.find(item => item.en === 'school');

  assert.ok(newSchool);
  assert.ok(school);
  assert.equal(newSchool.vi, 'trường mới');
  assert.equal(school.vi, 'trường học');
  assert.equal(expectedResponseDisplay(newSchool), 'new school');
  assert.equal(expectedResponseDisplay(school), 'school');

  assert.equal(evaluateQuestion(newSchool, 'new school').correct, true);
  assert.equal(evaluateQuestion(newSchool, 'newschool').correct, true);
  assert.equal(evaluateQuestion(newSchool, 'new   school').correct, true);
  assert.equal(evaluateQuestion(school, 'newschool').correct, false, 'extra letters are not whitespace tolerance');
});

test('typing error map never inserts alignment squares into the displayed canonical answer', async () => {
  const content = await g6U1VocabTypingRegistry[0].loadContent();
  const school = content.items.find(item => item.en === 'school');
  const newSchool = content.items.find(item => item.en === 'new school');
  assert.ok(school);
  assert.ok(newSchool);

  const schoolHtml = renderTypingErrorMapFeedback({
    feedback: { type: 'incorrect_reveal', entered: 'newschool', attemptNumber: 1 },
    item: school,
    masteryMessage: 'Mastery không đổi',
    esc: value => String(value)
  });
  assert.equal(canonicalAnswerText(schoolHtml), 'school');
  assert.doesNotMatch(canonicalAnswerMarkup(schoolHtml), /□/u);

  const newSchoolHtml = renderTypingErrorMapFeedback({
    feedback: { type: 'incorrect_reveal', entered: 'newscholl', attemptNumber: 1 },
    item: newSchool,
    masteryMessage: 'Mastery không đổi',
    esc: value => String(value)
  });
  assert.equal(canonicalAnswerText(newSchoolHtml), 'new school');
  assert.doesNotMatch(canonicalAnswerMarkup(newSchoolHtml), /□/u);
});

function canonicalAnswerMarkup(html) {
  const match = String(html).match(/<span class="typing-error-row-label">Đáp án đúng<\/span>\s*<code class="typing-diff-text">([\s\S]*?)<\/code>/u);
  assert.ok(match, 'canonical answer row must render');
  return match[1];
}

function canonicalAnswerText(html) {
  return canonicalAnswerMarkup(html).replace(/<[^>]+>/gu, '');
}
