import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U2WorkbookFolders, g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';

const expectedKeys = ['a1','a2','b3','b4','c1','c2','c3','d1','d2','d3b','e1','e2'];
const omittedSlugs = ['g6-u2-wb-b1','g6-u2-wb-b2','g6-u2-wb-b5','g6-u2-wb-d3a','g6-u2-wb-e3'];
async function load(key) { const descriptor = g6U2WorkbookRegistry.find(entry => entry.id === `g6-u2-wb-${key}`); assert.ok(descriptor); return { descriptor, content:await descriptor.loadContent() }; }
const sourceItems = content => content.items.filter(item => item.learningPhase === 'source');
function choiceText(item, id = item.correctChoiceId) { return item.choices?.find(choice => choice.id === id)?.text ?? ''; }

test('G6 U2 workbook publishes exactly the 12 approved text-based source lessons', () => {
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

test('E1 fixed sentence rewrites use sentence order with distractors', async () => {
  const { descriptor, content } = await load('e1'); const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['sentence_order']);
  assert.ok(items.every(item => item.type === 'sentence_order'));
  assert.deepEqual(items[0].correctOrder, ["There isn't",'a bookshelf','in my bedroom.']);
  assert.deepEqual(items[3].correctOrder, ['The microwave','is','behind','the dog.']);
});

test('open production stays open and no fixed long source typing answer remains', async () => {
  for (const key of ['a2','e2']) assert.ok(sourceItems((await load(key)).content).every(item => item.responseMode === 'open'));
  assert.equal(sourceItems((await load('c3')).content).at(-1).responseMode, 'open');
  for (const descriptor of g6U2WorkbookRegistry) for (const item of sourceItems(await descriptor.loadContent())) {
    if (item.type !== 'typing' || item.responseMode === 'open') continue;
    assert.ok(String(item.en ?? '').length <= 20, `${item.id} long typing answer`);
  }
});

test('source word-bank enhancer includes Unit 2 D1 without changing earlier support', async () => {
  const enhancer = await readFile(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url), 'utf8');
  assert.match(enhancer, /g6U2WorkbookRegistry/); assert.match(enhancer, /g6-u2-wb-d1/); assert.match(enhancer, /g6-u1-wb-b5/);
});

test('required micro-theory can unlock immediately when its content fits without scrolling', async () => {
  const gate = await readFile(new URL('../src/features/drill/renderTheoryGate.js', import.meta.url), 'utf8');
  assert.match(gate, /requestAnimationFrame\(updateProgress\)/); assert.match(gate, /else updateProgress\(\)/);
});