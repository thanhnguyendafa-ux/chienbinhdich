import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion } from '../src/core/questionTypes.js';
import { buildTypingErrorMap, isTypingSeparator, typingErrorMapEnabled } from '../src/core/typingErrorMap.js';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
import { validateSet } from '../src/data/contentValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';
import { renderTypingErrorMapFeedback } from '../src/features/drill/typingErrorMapRenderer.js';
import { g6U1VocabTypingGroups } from '../src/data/g6-u1-vocab-typing-content.js';
import { g6U1VocabTypingFolders, g6U1VocabTypingRegistry } from '../src/data/g6-u1-vocab-typing-catalog.js';

const EXPECTED_COUNTS = Object.freeze([28, 36, 19, 24, 19, 23, 19, 25]);

test('G6 U1 vocab typing freezes exactly 193 source-backed items across 8 groups', () => {
  const groups = Object.values(g6U1VocabTypingGroups);
  assert.equal(groups.length, 8);
  assert.deepEqual(groups.map(group => group.items.length), EXPECTED_COUNTS);

  const items = groups.flatMap(group => group.items);
  assert.equal(items.length, 193);
  assert.equal(items.filter(item => item.tier === 2).length, 116);
  assert.equal(items.filter(item => item.tier === 3).length, 77);
  assert.equal(new Set(items.map(item => item.id)).size, 193);
  assert.equal(new Set(items.map(item => item.en)).size, 193);

  for (const item of items) {
    assert.equal(item.type, 'typing');
    assert.ok(item.en.trim());
    assert.ok(item.vi.trim());
    assert.ok(item.exampleVi.trim());
    assert.deepEqual(item.sourceWordBank, [item.exampleVi]);
    assert.equal(item.sourceWordBankLabel, 'Ví dụ tiếng Việt dễ hiểu');
  }
});

test('G6 U1 vocab typing catalog publishes exactly 8 separator-tolerant error-map lessons', async () => {
  assert.equal(g6U1VocabTypingFolders.length, 1);
  assert.equal(g6U1VocabTypingFolders[0].parentId, 'global6-unit1');
  assert.equal(g6U1VocabTypingRegistry.length, 8);
  assert.deepEqual(g6U1VocabTypingRegistry.map(descriptor => descriptor.itemCount), EXPECTED_COUNTS);

  for (const descriptor of g6U1VocabTypingRegistry) {
    assert.equal(descriptor.version, 4);
    assert.equal(descriptor.typingTolerance, false);
    assert.equal(descriptor.typingSeparatorTolerance, true);
    assert.equal(descriptor.typingErrorMap, true);
    assert.equal(descriptor.passThreshold, 80);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    const content = await descriptor.loadContent();
    assert.ok(content.items.every(item => item.typingSeparatorTolerance === true));
    assert.ok(content.items.every(item => item.typingErrorMap === true));
    assert.ok(content.items.every(item => typingErrorMapEnabled(item)));
    assert.deepEqual(validateSet({ ...descriptor, ...content }), []);
  }
});

test('published catalog exposes the G6 U1 vocab typing folder and all 8 lessons', () => {
  assert.ok(lessonFolders.some(folder => folder.id === 'global6-unit1-vocab-typing' && folder.parentId === 'global6-unit1'));
  const published = lessonRegistry.filter(descriptor => descriptor.folderId === 'global6-unit1-vocab-typing');
  assert.equal(published.length, 8);
  assert.deepEqual(published.map(descriptor => descriptor.itemCount), EXPECTED_COUNTS);
});

test('typing prompt shows Vietnamese meaning and easy Vietnamese example without leaking English', () => {
  const item = g6U1VocabTypingGroups[1].items[0];
  assert.equal(item.en, 'new school');
  assert.equal(item.vi, 'trường mới');

  const html = renderQuestionInteraction(item);
  assert.match(html, /trường mới/);
  assert.match(html, /Ví dụ tiếng Việt dễ hiểu/);
  assert.match(html, /Em bắt đầu học ở một trường mới\./);
  assert.doesNotMatch(html, />new school</);
  assert.doesNotMatch(html, /value="new school"/);
});

test('separator tolerance is opt-in and keeps letter/case accuracy strict', async () => {
  const sourceItem = g6U1VocabTypingGroups[1].items[0];
  assert.equal(sourceItem.en, 'new school');
  assert.equal(evaluateQuestion(sourceItem, 'newschool').correct, false);

  const { items } = await g6U1VocabTypingRegistry[0].loadContent();
  const item = items[0];
  assert.equal(item.en, 'new school');
  assert.equal(item.typingSeparatorTolerance, true);
  assert.equal(evaluateQuestion(item, 'new school').correct, true);
  assert.equal(evaluateQuestion(item, 'newschool').correct, true);
  assert.equal(evaluateQuestion(item, 'new-school').correct, true);
  assert.equal(evaluateQuestion(item, 'Newschool').correct, false);
  assert.equal(evaluateQuestion(item, 'newscholl').correct, false);
});

test('separator tolerance accepts missing spaces, hyphens and question marks in any combination', () => {
  const hyphenated = Object.freeze({
    id: 'separator-hyphen-test',
    type: 'typing',
    en: 'after-school club',
    typingSeparatorTolerance: true
  });
  assert.equal(evaluateQuestion(hyphenated, 'afterschool club').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'after-schoolclub').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'afterschoolclub').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'after–schoolclub').correct, true);
  assert.equal(evaluateQuestion(hyphenated, 'afterscholclub').correct, false);

  const question = Object.freeze({
    id: 'separator-question-test',
    type: 'typing',
    en: 'How are you?',
    typingSeparatorTolerance: true
  });
  assert.equal(evaluateQuestion(question, 'How are you').correct, true);
  assert.equal(evaluateQuestion(question, 'Howareyou?').correct, true);
  assert.equal(evaluateQuestion(question, 'Howareyou').correct, true);
  assert.equal(evaluateQuestion(question, 'How are yuo').correct, false);
  assert.equal(evaluateQuestion(question, 'howareyou').correct, false);
});

test('typing error map marks real letter mistakes but never marks tolerated separators red', () => {
  const item = Object.freeze({
    id: 'error-map-question',
    type: 'typing',
    en: 'How are you?',
    typingSeparatorTolerance: true,
    typingErrorMap: true
  });
  const map = buildTypingErrorMap(item, 'How are yuo');
  assert.equal(map.expected, 'How are you?');
  assert.ok(map.mistakeCount > 0);
  assert.ok([...map.enteredTokens, ...map.expectedTokens].some(token => token.status !== 'correct' && token.text !== '□'));
  for (const token of [...map.enteredTokens, ...map.expectedTokens]) {
    if (isTypingSeparator(token.text)) assert.equal(token.status, 'correct');
  }

  const separatorOnly = buildTypingErrorMap(Object.freeze({
    id: 'error-map-hyphen',
    type: 'typing',
    en: 'after-school club',
    typingSeparatorTolerance: true,
    typingErrorMap: true
  }), 'afterschoolclub');
  assert.equal(separatorOnly.mistakeCount, 0);
  assert.ok([...separatorOnly.enteredTokens, ...separatorOnly.expectedTokens].every(token => token.status === 'correct'));
});

test('typing error map shows a red missing-letter marker against the expected letter', async () => {
  const { items } = await g6U1VocabTypingRegistry[0].loadContent();
  const item = items[0];
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
  assert.match(html, /□/);
});

test('error-map lessons reveal the comparison on the first wrong attempt and record that reveal in session SSOT', async () => {
  const descriptor = g6U1VocabTypingRegistry[0];
  const content = await descriptor.loadContent();
  const set = { ...descriptor, ...content };
  const session = createSession({ studentName: 'Test', set, now: 1000 });
  const result = submitAnswer({ session, set, response: 'newscholl', now: 2000 });

  assert.equal(result.event.type, 'incorrect_reveal');
  assert.equal(result.event.attemptNumber, 1);
  assert.equal(result.event.revealAnswer, 'new school');
  assert.equal(result.session.attempts[0].answerRevealedBeforeAttempt, false);
  assert.equal(result.session.attempts[0].answerRevealedAfterAttempt, true);
});
