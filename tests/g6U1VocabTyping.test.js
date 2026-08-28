import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion } from '../src/core/questionTypes.js';
import { validateSet } from '../src/data/contentValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';
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

test('G6 U1 vocab typing catalog publishes exactly 8 separator-tolerant all-items lessons', async () => {
  assert.equal(g6U1VocabTypingFolders.length, 1);
  assert.equal(g6U1VocabTypingFolders[0].parentId, 'global6-unit1');
  assert.equal(g6U1VocabTypingRegistry.length, 8);
  assert.deepEqual(g6U1VocabTypingRegistry.map(descriptor => descriptor.itemCount), EXPECTED_COUNTS);

  for (const descriptor of g6U1VocabTypingRegistry) {
    assert.equal(descriptor.version, 3);
    assert.equal(descriptor.typingTolerance, false);
    assert.equal(descriptor.typingSeparatorTolerance, true);
    assert.equal(descriptor.passThreshold, 80);
    assert.equal(descriptor.completionPolicy, 'all-items');
    assert.deepEqual(descriptor.activityTypes, ['typing']);
    const content = await descriptor.loadContent();
    assert.ok(content.items.every(item => item.typingSeparatorTolerance === true));
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
