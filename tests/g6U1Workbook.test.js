import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, expectedResponseDisplay } from '../src/core/questionTypes.js';
import { orderForExposure } from '../src/core/exposureOrder.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { getG6U1WorkbookContent } from '../src/data/g6-u1-workbook-content.js';

async function load(key) {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === `g6-u1-wb-${key}`);
  assert.ok(descriptor, `missing descriptor ${key}`);
  return { descriptor, content: await descriptor.loadContent() };
}
const sourceItems = content => content.items.filter(item => item.learningPhase === 'source');
function correctChoiceText(item) { return item.choices?.find(choice => choice.id === item.correctChoiceId)?.text ?? ''; }

test('Global 6 Unit 1 workbook publishes exactly the 14 retained SBT lessons', () => {
  assert.equal(g6U1WorkbookRegistry.length, 14);
  const keys = g6U1WorkbookRegistry.map(entry => entry.id);
  assert.ok(!keys.some(id => /-a2$|-b1$|-c2$/.test(id)));
  assert.deepEqual(keys.slice(0, 3), ['g6-u1-wb-a1','g6-u1-wb-b2','g6-u1-wb-b3']);
});

test('typing accepts source-supported alternative answers', () => {
  const item = getG6U1WorkbookContent('b4').items.find(candidate => candidate.id === 'g6-u1-wb-b4-06a');
  assert.equal(evaluateQuestion(item, 'spending', { typingTolerance:true }).correct, true);
  assert.equal(evaluateQuestion(item, 'to spend', { typingTolerance:true }).correct, true);
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
  assert.deepEqual(ordered.map(choice => choice.id), ['A','B','C','D']);
});

test('B5 and D1 use word-bank choice instead of typing and keep source bank metadata', async () => {
  const { content:b5 } = await load('b5'); const b5Source = sourceItems(b5);
  const { content:d1 } = await load('d1'); const d1Source = sourceItems(d1);
  const b5Bank = ['ball games','have','English lessons','international','housework','subjects','share','study'];
  const d1Bank = ['their','begins','on','go','off','school','all','learn'];
  assert.ok(b5Source.every(item => item.type === 'mcq'));
  assert.ok(d1Source.every(item => item.type === 'mcq'));
  assert.deepEqual(b5Source[0].sourceWordBank, b5Bank);
  assert.deepEqual(d1Source[0].sourceWordBank, d1Bank);
  assert.equal(correctChoiceText(b5Source[0]), 'English lessons');
  assert.equal(correctChoiceText(d1Source[0]), 'go');
});

test('B6 and E1/E2 use sentence order because source task is building word order', async () => {
  const b6 = sourceItems((await load('b6')).content);
  const e1 = sourceItems((await load('e1')).content);
  const e2 = sourceItems((await load('e2')).content);
  assert.ok(b6.every(item => item.type === 'sentence_order'));
  assert.ok(e1.every(item => item.type === 'sentence_order'));
  assert.ok(e2.every(item => item.type === 'sentence_order'));
  assert.deepEqual(b6[0].correctOrder, ['My grandmother','is','always','at home','in the evening']);
  assert.deepEqual(e1[0].correctOrder, ['What','are','your']);
  assert.deepEqual(e2[3].correctOrder, ['Where','does','Ms Lan','live?']);
  assert.ok(b6[0].tokens.includes('are'));
  assert.ok(e2[3].tokens.includes('lives?'));
});

test('D2 keeps short recall typing but moves long fixed reading answers to MCQ', async () => {
  const { descriptor, content } = await load('d2');
  const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['mcq','typing']);
  assert.deepEqual(items.map(item => item.type), ['mcq','mcq','typing','typing','mcq']);
  assert.match(correctChoiceText(items[0]), /teachers and most of his classmates/);
  assert.equal(items[2].en, 'IT.');
  assert.equal(items[3].en, 'The judo club.');
  assert.match(correctChoiceText(items[4]), /good first day/);
});

test('source word-bank enhancer module is importable without a browser DOM', async () => {
  await assert.doesNotReject(import('../src/features/drill/sourceWordBankEnhancer.js'));
});

test('D3 final source answer remains B before as in the SBT solution', async () => {
  const items = sourceItems((await load('d3')).content);
  const item = items.at(-1);
  assert.equal(item.correctChoiceId, 'B');
  assert.equal(item.choices.find(choice => choice.id === 'B').text, 'before');
});