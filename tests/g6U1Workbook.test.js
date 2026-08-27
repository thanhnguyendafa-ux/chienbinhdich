import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion, expectedResponseDisplay } from '../src/core/questionTypes.js';
import { orderForExposure } from '../src/core/exposureOrder.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { getG6U1WorkbookContent } from '../src/data/g6-u1-workbook-content.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';

async function load(key) {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === `g6-u1-wb-${key}`);
  assert.ok(descriptor, `missing descriptor ${key}`);
  return { descriptor, content: await descriptor.loadContent() };
}
const sourceItems = content => content.items.filter(item => item.learningPhase === 'source');
function correctChoiceText(item) { return item.choices?.find(choice => choice.id === item.correctChoiceId)?.text ?? ''; }
const bankCount = html => (html.match(/class="source-word-bank"/g) ?? []).length;

test('Global 6 Unit 1 workbook publishes all 15 text-solvable lessons after PDF audit', () => {
  assert.equal(g6U1WorkbookRegistry.length, 15);
  const keys = g6U1WorkbookRegistry.map(entry => entry.id);
  assert.ok(!keys.some(id => /-a2$|-b1$/.test(id)));
  assert.ok(keys.includes('g6-u1-wb-c2'));
  assert.deepEqual(keys.slice(0, 3), ['g6-u1-wb-a1','g6-u1-wb-b2','g6-u1-wb-b3']);
});

test('recovered C2 keeps all five cue sets as five question + answer pairs', async () => {
  const { descriptor,content } = await load('c2');
  const items = sourceItems(content);
  assert.equal(descriptor.sourceItemCount,10);
  assert.equal(items.length,10);
  assert.ok(items.every(item => item.type === 'sentence_order'));
  assert.deepEqual(items[0].correctOrder,['When','does','your grandfather','usually','read','newspapers?']);
  assert.deepEqual(items[1].correctOrder,['He','usually','reads newspapers','in the morning.']);
  assert.deepEqual(items[8].correctOrder,['What time','does','David','often','listen to music?']);
  assert.deepEqual(items[9].correctOrder,['He','often','listens to music','at 9 p.m.']);
  assert.ok(items[0].tokens.includes('do'));
  assert.ok(items[8].tokens.includes('listens to music?'));
});

test('typing accepts source-supported alternative answers before digital adaptation', () => {
  const item = getG6U1WorkbookContent('b4').items.find(candidate => candidate.id === 'g6-u1-wb-b4-06a');
  assert.equal(evaluateQuestion(item, 'spending', { typingTolerance:true }).correct, true);
  assert.equal(evaluateQuestion(item, 'to spend', { typingTolerance:true }).correct, true);
  assert.match(expectedResponseDisplay(item), /spending/);
});

test('raw source keeps open production permissive before interaction adaptation', () => {
  const item = getG6U1WorkbookContent('e3').items[0];
  assert.equal(evaluateQuestion(item, 'My class rules are important.').correct, true);
  assert.equal(evaluateQuestion(item, '   ').correct, false);
});

test('workbook choices marked preserveOrder stay in SBT order', () => {
  const item = getG6U1WorkbookContent('a1').items[0];
  const ordered = orderForExposure(item.choices, 'any-session-key');
  assert.deepEqual(ordered.map(choice => choice.id), ['A','B','C','D']);
});

test('B3 and B4 closed-answer source tasks use MCQ instead of typing', async () => {
  const b3 = sourceItems((await load('b3')).content);
  const b4 = sourceItems((await load('b4')).content);
  assert.equal(b3.length, 8);
  assert.equal(b4.length, 12);
  assert.ok(b3.every(item => item.type === 'mcq'));
  assert.ok(b4.every(item => item.type === 'mcq'));
  assert.equal(correctChoiceText(b3[2]), 'bike / bicycle');
  assert.equal(correctChoiceText(b4[10]), 'Cả A và B đều được chấp nhận');
});

test('C1 C3 E3 open production tasks are adapted to MCQ with no typing UI', async () => {
  for (const key of ['c1','c3','e3']) {
    const { descriptor, content } = await load(key);
    const items = sourceItems(content);
    assert.deepEqual(descriptor.sourceActivityTypes, ['mcq']);
    assert.equal(items.length, 1);
    assert.equal(items[0].type, 'mcq');
    assert.equal(items[0].digitalAdaptation?.sourceResponseType, 'open_written_or_spoken_response');
    assert.equal(items[0].digitalAdaptation?.adaptedResponseType, 'mcq');
    assert.equal('typingUi' in items[0], false);
    assert.equal('responseMode' in items[0], false);
  }
  assert.match(correctChoiceText(sourceItems((await load('c1')).content)[0]), /this is Minh, my new friend/);
  assert.match(correctChoiceText(sourceItems((await load('c3')).content)[0]), /Nguyen Du Secondary School/);
  assert.match(correctChoiceText(sourceItems((await load('e3')).content)[0]), /arrive on time/);
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

test('D2 reading uses MCQ for all five closed answers', async () => {
  const { descriptor, content } = await load('d2');
  const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['mcq']);
  assert.ok(items.every(item => item.type === 'mcq'));
  assert.match(correctChoiceText(items[0]), /teachers and most of his classmates/);
  assert.equal(correctChoiceText(items[2]), 'IT.');
  assert.equal(correctChoiceText(items[3]), 'The judo club.');
  assert.match(correctChoiceText(items[4]), /good first day/);
});

test('published Unit 1 has zero typing items end to end', async () => {
  for (const descriptor of g6U1WorkbookRegistry) {
    assert.ok(!descriptor.sourceActivityTypes.includes('typing'), `${descriptor.id} catalog must not advertise typing`);
    const content = await descriptor.loadContent();
    const typingItems = content.items.filter(item => item.type === 'typing');
    assert.equal(typingItems.length, 0, `${descriptor.id} must have zero published typing items`);
  }
});

test('direct word-bank rendering is browser-DOM independent and scoped to its owner item', async () => {
  const b5 = sourceItems((await load('b5')).content);
  assert.equal(bankCount(renderQuestionInteraction(b5[0])), 1);
  const preload = (await load('b5')).content.items.find(item => item.learningPhase !== 'source' && !item.sourceWordBank?.length);
  assert.ok(preload);
  assert.equal(bankCount(renderQuestionInteraction(preload)), 0);
});

test('D3 final source answer remains B before as in the SBT solution', async () => {
  const items = sourceItems((await load('d3')).content);
  const item = items.at(-1);
  assert.equal(item.correctChoiceId, 'B');
  assert.equal(item.choices.find(choice => choice.id === 'B').text, 'before');
});