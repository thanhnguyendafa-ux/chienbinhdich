import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U2WorkbookFolders, g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';

const expectedKeys = ['a1','a2','b2','b3','b4','c1','c2','c3','d1','d2','d3b','e1','e2','e3'];
const omittedSlugs = ['g6-u2-wb-b1','g6-u2-wb-b5','g6-u2-wb-d3a'];
async function load(key) { const descriptor = g6U2WorkbookRegistry.find(entry => entry.id === `g6-u2-wb-${key}`); assert.ok(descriptor); return { descriptor, content:await descriptor.loadContent() }; }
const sourceItems = content => content.items.filter(item => item.learningPhase === 'source');
function choiceText(item, id = item.correctChoiceId) { return item.choices?.find(choice => choice.id === id)?.text ?? ''; }
const bankCount = html => (html.match(/class="source-word-bank"/g) ?? []).length;

test('G6 U2 workbook publishes all 14 text-solvable source lessons after PDF audit', () => {
  assert.equal(g6U2WorkbookFolders.length,1);
  assert.deepEqual(g6U2WorkbookRegistry.map(entry => entry.id), expectedKeys.map(key => `g6-u2-wb-${key}`));
  for (const slug of omittedSlugs) assert.equal(g6U2WorkbookRegistry.some(entry => entry.lessonSlug === slug), false);
});

test('every G6 U2 workbook lesson has theory, translation preload and valid content', async () => {
  for (const descriptor of g6U2WorkbookRegistry) {
    const content = await descriptor.loadContent();
    assert.equal(content.preLessonTheory?.required, true);
    assert.equal(content.translationPreload?.required, true);
    assert.deepEqual(content.translationPreload?.order, ['vocab','phrase','source']);
    assert.equal(content.items.length, descriptor.itemCount);
    assert.equal(content.items.filter(item => item.learningPhase === 'vocab').length, 4);
    assert.equal(content.items.filter(item => item.learningPhase === 'phrase').length, 4);
    assert.equal(sourceItems(content).length, descriptor.sourceItemCount);
    assert.deepEqual(validateSet({ ...descriptor, ...content }), [], `${descriptor.id} validation`);
    for (const item of content.items) {
      assert.equal(item.theorySupport?.access, 'after_submit');
      assert.ok(item.teachingFeedback?.reason);
    }
  }
});

test('recovered B2 preserves all eight hidden words without using image input', async () => {
  const { descriptor,content } = await load('b2');
  const [item] = sourceItems(content);
  assert.equal(descriptor.sourceItemCount,1);
  assert.equal(item.type,'classification');
  const found = item.tokens.filter(token => token.correctGroupId === 'yes').map(token => token.text).sort();
  assert.deepEqual(found,['bathroom','bedroom','cupboard','hall','kitchen','lamp','poster','sofa']);
  assert.equal(item.tokens.filter(token => token.correctGroupId === 'no').length,8);
  assert.equal(item.digitalAdaptation?.sourceResponseType,'word_search_grid');
  assert.match(item.prompt,/A A H H L A M P/);
});

test('A1, B3, B4, C1 and C2 retain the workbook answer key after preload', async () => {
  const a1 = sourceItems((await load('a1')).content); const soundByWord = Object.fromEntries(a1[0].tokens.map(token => [token.text, token.correctGroupId]));
  assert.deepEqual(soundByWord, { beds:'z', caps:'s', posters:'z', clocks:'s', villas:'z', lights:'s' });
  const b3 = sourceItems((await load('b3')).content); assert.deepEqual(b3.map(item => item.correctChoiceId), ['C','B','D','D','A']);
  const b4 = sourceItems((await load('b4')).content); assert.deepEqual(b4.map(item => item.en), ["Mai's","Nam's","grandmother's","cousin's","Tom's","sister's"]);
  const c1 = sourceItems((await load('c1')).content); assert.deepEqual(c1[0].correctOrder, ['C','A','E','B','D']);
  const c2 = sourceItems((await load('c2')).content); assert.deepEqual(c2.map(item => item.correctChoiceId), ['C','E','B','D','A']);
});

test('D1 uses source word box as direct choices and D2 keeps A/B/C order', async () => {
  const d1 = sourceItems((await load('d1')).content); const expectedBank = ['untidy','are','not','near','next','on','his','school bag'];
  assert.ok(d1.every(item => item.type === 'mcq'));
  assert.deepEqual(d1[0].sourceWordBank, expectedBank);
  assert.deepEqual(d1.map(item => choiceText(item)), ['are','near','on','school bag','next','untidy','not','his']);
  const d2 = sourceItems((await load('d2')).content); assert.deepEqual(d2.map(item => item.correctChoiceId), ['B','B','C','A','C','B']);
});

test('C3 uses sentence order for six fixed cue-built lines and keeps final conversation open', async () => {
  const { descriptor, content } = await load('c3'); const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['sentence_order','typing']);
  assert.ok(items.slice(0,6).every(item => item.type === 'sentence_order'));
  assert.deepEqual(items[0].correctOrder, ['Mira,','who','do','you','live','with?']);
  assert.equal(items[6].responseMode, 'open');
});

test('D3b reading keeps deterministic source answers', async () => {
  const { descriptor, content } = await load('d3b'); const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['mcq']);
  assert.deepEqual(items.map(item => item.correctChoiceId), ['B','D','A','C','B']);
  assert.equal(choiceText(items[0]), 'It is big and cozy.');
  assert.match(choiceText(items[1]), /three posters/);
  assert.doesNotMatch(choiceText(items[1]), /table/i);
});

test('E1 rewrite stays typing because learners must supply added words and structures', async () => {
  const { descriptor, content } = await load('e1'); const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['typing']);
  assert.ok(items.every(item => item.type === 'typing'));
  assert.equal(items[0].en, "There isn't a bookshelf in my bedroom.");
  assert.equal(items[3].en, 'The microwave is behind the dog.');
  assert.equal(items[4].en, 'I like the living room best in the house.');
});

test('recovered E3 drops drawing but keeps room description as five guided sentence-order lines', async () => {
  const { descriptor,content } = await load('e3');
  const items = sourceItems(content);
  assert.equal(descriptor.sourceItemCount,5);
  assert.ok(items.every(item => item.type === 'sentence_order'));
  assert.deepEqual(items[0].correctOrder,['My favourite room','is','my bedroom.']);
  assert.deepEqual(items.at(-1).correctOrder,['I like','my bedroom','because','it is','comfortable.']);
  assert.ok(items.every(item => item.digitalAdaptation?.omittedSourceStep === 'drawing'));
});

test('open production stays open where the source genuinely asks for personal answers', async () => {
  for (const key of ['a2','e2']) assert.ok(sourceItems((await load(key)).content).every(item => item.responseMode === 'open'));
  assert.equal(sourceItems((await load('c3')).content).at(-1).responseMode, 'open');
});

test('fixed long typing is allowed only for rewrite tasks that require added language', async () => {
  for (const descriptor of g6U2WorkbookRegistry) for (const item of sourceItems(await descriptor.loadContent())) {
    if (item.type !== 'typing' || item.responseMode === 'open' || String(item.en ?? '').length <= 20) continue;
    assert.match(item.id,/^g6-u2-wb-e1-/,`${item.id} unexpected long fixed typing`);
  }
});

test('Unit 2 D1 word bank renders exactly once from the current item and never from lesson-wide registry state', async () => {
  const content = (await load('d1')).content;
  const owner = sourceItems(content)[0];
  assert.equal(bankCount(renderQuestionInteraction(owner)),1);
  const preload = content.items.find(item => item.learningPhase !== 'source' && !item.sourceWordBank?.length);
  assert.ok(preload);
  assert.equal(bankCount(renderQuestionInteraction(preload)),0);
});

test('required micro-theory can unlock immediately when its content fits without scrolling', async () => {
  const gate = await readFile(new URL('../src/features/drill/renderTheoryGate.js', import.meta.url), 'utf8');
  assert.match(gate, /requestAnimationFrame\(updateProgress\)/); assert.match(gate, /else updateProgress\(\)/);
});