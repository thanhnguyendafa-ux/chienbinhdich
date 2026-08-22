import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U3WorkbookFolders, g6U3WorkbookRegistry } from '../src/data/g6-u3-workbook-catalog.js';

const expectedKeys = ['a2','b1','b2','b3','b4','b5','b6','c1','c3','d1','d2','d3','e1','e2','e3'];
const omittedSlugs = ['g6-u3-wb-a1','g6-u3-wb-c2'];
async function load(key) { const descriptor = g6U3WorkbookRegistry.find(entry => entry.id === `g6-u3-wb-${key}`); assert.ok(descriptor); return { descriptor, content:await descriptor.loadContent() }; }
const sourceItems = content => content.items.filter(item => item.learningPhase === 'source');
function correctChoiceText(item) { return item.choices?.find(choice => choice.id === item.correctChoiceId)?.text ?? ''; }
function yesWords(item) { return item.tokens.filter(token => token.correctGroupId === 'yes').map(token => token.text); }

test('G6 U3 workbook publishes exactly 15 approved text-based lessons under Unit 3', () => {
  assert.deepEqual(g6U3WorkbookFolders.map(folder => folder.id), ['global6-unit3','global6-unit3-workbook']);
  assert.deepEqual(g6U3WorkbookRegistry.map(entry => entry.id), expectedKeys.map(key => `g6-u3-wb-${key}`));
  for (const slug of omittedSlugs) assert.equal(g6U3WorkbookRegistry.some(entry => entry.lessonSlug === slug), false);
});

test('every G6 U3 workbook lesson has micro-theory, translation preload, feedback and valid content', async () => {
  for (const descriptor of g6U3WorkbookRegistry) {
    const content = await descriptor.loadContent();
    assert.equal(content.preLessonTheory?.required, true);
    assert.equal(content.translationPreload?.required, true);
    assert.deepEqual(content.translationPreload?.order, ['vocab','phrase','source']);
    assert.equal(content.items.filter(item => item.learningPhase === 'vocab').length, 4);
    assert.equal(content.items.filter(item => item.learningPhase === 'phrase').length, 4);
    assert.equal(sourceItems(content).length, descriptor.sourceItemCount);
    assert.equal(content.items.length, descriptor.itemCount);
    assert.deepEqual(validateSet({ ...descriptor, ...content }), [], `${descriptor.id} validation`);
    for (const item of content.items) { assert.equal(item.theorySupport?.access, 'after_submit'); assert.ok(item.teachingFeedback?.reason?.length > 15); }
  }
});

test('A2 keeps pronunciation as self-confirmed source practice', async () => {
  const items = sourceItems((await load('a2')).content);
  assert.equal(items.length,3); assert.ok(items.every(item => item.type === 'typing' && item.responseMode === 'open'));
  assert.ok(items.every(item => item.typingUi?.instruction?.includes('không chấm phát âm bằng micro')));
});

test('B1 preserves source overlap and verified answer key', async () => {
  const items = sourceItems((await load('b1')).content);
  assert.equal(items.length,3); assert.ok(items.every(item => item.type === 'classification'));
  assert.deepEqual(yesWords(items[0]), ['big','long','small','short','slim']);
  assert.deepEqual(yesWords(items[1]), ['arms','legs','shoulders','hands','eyes','feet','ears','hair','head']);
  assert.deepEqual(yesWords(items[2]), ['big','small','fast','short','cute','strong','weak','smart','tall','slim','sporty']);
  assert.ok(items.every(item => item.sourceKeyVerification?.status === 'verified_against_multiple_published_solution_guides'));
});

test('B2 keeps recall typing while B3 uses source word bank as choices', async () => {
  const b2 = sourceItems((await load('b2')).content); assert.deepEqual(b2.map(item => item.en), ['careful','creative','kind','loving','hard-working','shy']);
  const b3 = sourceItems((await load('b3')).content); const bank = ['careful','creative','kind','loving','hard-working','shy'];
  assert.ok(b3.every(item => item.type === 'mcq')); assert.ok(b3.every(item => JSON.stringify(item.sourceWordBank) === JSON.stringify(bank)));
  assert.deepEqual(b3.map(correctChoiceText), ['creative','careful','shy','kind','loving']);
});

test('B4 keeps short verb-form typing while B5 is diagnostic MCQ', async () => {
  const b4 = sourceItems((await load('b4')).content); assert.deepEqual(b4.map(item => item.en), ['is taking','is helping','is knocking','Are','doing','am writing','is','talking','Are','reading']);
  const { descriptor, content } = await load('b5'); const b5 = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['mcq']); assert.ok(b5.every(item => item.type === 'mcq'));
  assert.deepEqual(b5.map(correctChoiceText), ['is','is wearing','is playing','likes','are','is looking','smiling']);
});

test('B6 uses sentence order with grammar distractors', async () => {
  const { descriptor, content } = await load('b6'); const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['sentence_order']); assert.ok(items.every(item => item.type === 'sentence_order'));
  assert.deepEqual(items[0].correctOrder, ['Our grandparents','are','watching','TV','in the living room.']);
  assert.ok(items[0].tokens.includes('is')); assert.ok(items[0].tokens.includes('watch'));
});

test('C1 uses sentence order for fixed cues and keeps final conversation open', async () => {
  const { descriptor, content } = await load('c1'); const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['sentence_order','typing']);
  assert.ok(items.slice(0,5).every(item => item.type === 'sentence_order'));
  assert.equal(items[5].type,'typing'); assert.equal(items[5].responseMode,'open');
});

test('C3, D2 and E3 remain open source production', async () => {
  for (const key of ['c3','d2','e3']) assert.ok(sourceItems((await load(key)).content).every(item => item.type === 'typing' && item.responseMode === 'open'), key);
  assert.match(sourceItems((await load('d2')).content)[0].vi, /good friends are reliable/);
  assert.match(sourceItems((await load('e3')).content)[0].vi, /about 70 words/);
});

test('D1 uses exact six-word source bank as direct choices', async () => {
  const items = sourceItems((await load('d1')).content); const bank = ['funny','is','kind','time','cook','hair'];
  assert.ok(items.every(item => item.type === 'mcq')); assert.ok(items.every(item => JSON.stringify(item.sourceWordBank) === JSON.stringify(bank)));
  assert.deepEqual(items.map(correctChoiceText), ['is','hair','cook','kind','funny','time']);
});

test('D3 keeps all source statements in one evidence classification board', async () => {
  const { descriptor, content } = await load('d3'); const items = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['classification']); assert.equal(items.length,1);
  assert.equal(items[0].tokens.length,5); assert.deepEqual(items[0].tokens.map(token => token.correctGroupId), ['yes','no','yes','no','yes']);
});

test('E1 and E2 use classification for whole writing structure', async () => {
  const e1 = sourceItems((await load('e1')).content); const map = Object.fromEntries(e1[0].tokens.map(token => [token.id, token.correctGroupId]));
  assert.deepEqual(map, { a:'beginning', b:'middle', c:'middle', d:'end' });
  const { descriptor, content } = await load('e2'); const e2 = sourceItems(content);
  assert.deepEqual(descriptor.sourceActivityTypes, ['classification']); assert.equal(e2.length,1);
  assert.deepEqual(e2[0].tokens.map(token => token.correctGroupId), ['A','C','B','B','B','C','D']);
});

test('no fixed long source typing answer remains where recognition or ordering is the goal', async () => {
  for (const descriptor of g6U3WorkbookRegistry) for (const item of sourceItems(await descriptor.loadContent())) {
    if (item.type !== 'typing' || item.responseMode === 'open') continue;
    assert.ok(String(item.en ?? '').length <= 20, `${item.id} fixed typing answer too long`);
  }
});

test('source word-bank enhancer retains Unit 3 support', async () => {
  const enhancer = await readFile(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url), 'utf8');
  assert.match(enhancer, /g6U3WorkbookRegistry/); assert.match(enhancer, /g6-u3-wb-b3/); assert.match(enhancer, /g6-u3-wb-d1/);
});