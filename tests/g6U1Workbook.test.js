import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, expectedResponseDisplay } from '../src/core/questionTypes.js';
import { orderForExposure } from '../src/core/exposureOrder.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { getG6U1WorkbookContent } from '../src/data/g6-u1-workbook-content.js';

test('Global 6 Unit 1 workbook publishes exactly the 14 retained SBT lessons', () => {
  assert.equal(g6U1WorkbookRegistry.length, 14);
  const keys = g6U1WorkbookRegistry.map(entry => entry.id);
  assert.ok(!keys.some(id => /-a2$|-b1$|-c2$/.test(id)));
  assert.deepEqual(keys.slice(0, 3), ['g6-u1-wb-a1', 'g6-u1-wb-b2', 'g6-u1-wb-b3']);
});

test('typing accepts source-supported alternative answers', () => {
  const item = getG6U1WorkbookContent('b4').items.find(candidate => candidate.id === 'g6-u1-wb-b4-06a');
  assert.equal(evaluateQuestion(item, 'spending', { typingTolerance: true }).correct, true);
  assert.equal(evaluateQuestion(item, 'to spend', { typingTolerance: true }).correct, true);
  assert.match(expectedResponseDisplay(item), /spending/);
});

test('open SBT production tasks accept any non-empty student response', () => {
  const item = getG6U1WorkbookContent('e3').items[0];
  assert.equal(evaluateQuestion(item, 'My class rules are important.').correct, true);
  assert.equal(evaluateQuestion(item, '   ').correct, false);
});

test('workbook choices marked preserveOrder stay in SBT order', () => {
  const item = getG6U1WorkbookContent('a1').items[0];
  const ordered = orderForExposure(item.choices, 'any-session-key');
  assert.deepEqual(ordered.map(choice => choice.id), ['A', 'B', 'C', 'D']);
});

test('B5 and D1 keep typing while exposing their SBT word banks as separate UI metadata', async () => {
  const b5Descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-b5');
  const d1Descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-d1');
  const [b5, d1] = await Promise.all([b5Descriptor.loadContent(), d1Descriptor.loadContent()]);

  assert.ok(b5.items.every(item => item.type === 'typing'));
  assert.ok(d1.items.every(item => item.type === 'typing'));
  assert.equal(b5.items[0].en, 'English lessons');
  assert.equal(d1.items[0].en, 'go');
  assert.deepEqual(b5.items[0].sourceWordBank, ['ball games', 'have', 'English lessons', 'international', 'housework', 'subjects', 'share', 'study']);
  assert.deepEqual(d1.items[0].sourceWordBank, ['their', 'begins', 'on', 'go', 'off', 'school', 'all', 'learn']);
  assert.equal(b5.items[0].sourceWordBankLabel, 'Từ / cụm từ cho sẵn');
  assert.doesNotMatch(b5.items[0].vi, /Word box:|Từ \/ cụm từ cho sẵn:/);
  assert.match(b5.items[0].vi, /Do you have ______ on Monday/);
  assert.match(d1.items[0].vi, /In England, when the schoolchildren come to school/);
});

test('source word-bank enhancer module is importable without a browser DOM', async () => {
  await assert.doesNotReject(import('../src/features/drill/sourceWordBankEnhancer.js'));
});

test('D3 final answer remains B before as in the SBT solution', () => {
  const item = getG6U1WorkbookContent('d3').items.at(-1);
  assert.equal(item.correctChoiceId, 'B');
  assert.equal(item.choices.find(choice => choice.id === 'B').text, 'before');
});
