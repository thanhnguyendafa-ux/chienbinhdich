import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U1WorkbookFolders, g7U1WorkbookRegistry } from '../src/data/g7-u1-workbook-catalog.js';

const keys = ['a2','b4','b5','c1','c2','c3','d1','d2','d3a','d3b','e1','e3'];
const omitted = ['a1','b1','b2','b3','e2'];

async function load(key) {
  const descriptor = g7U1WorkbookRegistry.find(entry => entry.id === `g7-u1-wb-${key}`);
  assert.ok(descriptor, `missing ${key}`);
  return { descriptor, content: await descriptor.loadContent() };
}

function sourceItems(content) { return content.items.filter(item => item.learningPhase === 'source'); }
function vocabItems(content) { return content.items.filter(item => item.learningPhase === 'vocab'); }
function phraseItems(content) { return content.items.filter(item => item.learningPhase === 'phrase'); }
function correctText(item) { return item.choices?.find(choice => choice.id === item.correctChoiceId)?.text ?? ''; }

test('G7 U1 workbook publishes exactly 12 text-based lessons under Unit 1', () => {
  assert.deepEqual(g7U1WorkbookFolders.map(folder => folder.id), ['global7-unit1-workbook']);
  assert.equal(g7U1WorkbookFolders[0].parentId, 'global7-unit1');
  assert.deepEqual(g7U1WorkbookRegistry.map(entry => entry.id), keys.map(key => `g7-u1-wb-${key}`));
  for (const key of omitted) assert.equal(g7U1WorkbookRegistry.some(entry => entry.id === `g7-u1-wb-${key}`), false);
});

test('every lesson uses the required flow: theory, vocab MCQ, phrase MCQ, then source exercise', async () => {
  for (const descriptor of g7U1WorkbookRegistry) {
    const content = await descriptor.loadContent();
    assert.equal(content.preLessonTheory?.required, true, `${descriptor.id} theory`);
    assert.ok(content.preLessonTheory?.title?.startsWith('Nhắc nhanh'), `${descriptor.id} title`);
    assert.ok(vocabItems(content).length > 0, `${descriptor.id} vocab`);
    assert.ok(phraseItems(content).length > 0, `${descriptor.id} phrase`);
    assert.ok(sourceItems(content).length > 0, `${descriptor.id} source`);
    assert.ok(vocabItems(content).every(item => item.type === 'mcq'));
    assert.ok(phraseItems(content).every(item => item.type === 'mcq'));
    const phases = content.items.map(item => item.learningPhase);
    const firstPhrase = phases.indexOf('phrase');
    const firstSource = phases.indexOf('source');
    assert.ok(firstPhrase > 0 && firstSource > firstPhrase, `${descriptor.id} phase order`);
    assert.ok(phases.slice(0, firstPhrase).every(phase => phase === 'vocab'));
    assert.ok(phases.slice(firstPhrase, firstSource).every(phase => phase === 'phrase'));
    assert.ok(phases.slice(firstSource).every(phase => phase === 'source'));
    assert.equal(content.items.length, descriptor.itemCount, `${descriptor.id} count`);
    assert.deepEqual(validateSet({ ...descriptor, ...content }), [], `${descriptor.id} validate`);
  }
});

test('translation preload uses four plausible choices and Vietnamese child-friendly feedback', async () => {
  for (const descriptor of g7U1WorkbookRegistry) {
    const content = await descriptor.loadContent();
    for (const item of [...vocabItems(content), ...phraseItems(content)]) {
      assert.equal(item.choices.length, 4, item.id);
      assert.equal(new Set(item.choices.map(choice => choice.text)).size, 4, item.id);
      assert.ok(item.prompt.includes('có nghĩa là gì?'), item.id);
      assert.ok(item.teachingFeedback?.reason?.length > 12, item.id);
      assert.ok(item.choices.every(choice => choice.preserveOrder === true), item.id);
    }
  }
});

test('A2 keeps the five source pronunciation questions and answer pattern C B A B A', async () => {
  const { content } = await load('a2');
  const source = sourceItems(content);
  assert.equal(source.length, 5);
  assert.deepEqual(source.map(item => item.correctChoiceId), ['C','B','A','B','A']);
  assert.deepEqual(source[0].choices.map(choice => choice.text), ['away','around','classmate']);
  assert.deepEqual(source[4].choices.map(choice => choice.text), ['surprise','Thursday','hurt']);
});

test('B4 and B5 preserve grammar targets and answers', async () => {
  const { content:b4 } = await load('b4');
  assert.deepEqual(sourceItems(b4).map(item => item.correctChoiceId), ['C','B','C','A','B']);
  const { content:b5 } = await load('b5');
  assert.deepEqual(sourceItems(b5).map(item => item.en), ['loves','doesn’t go','learns','gets','shares','enjoy','make','meet']);
  assert.match(sourceItems(b5)[0].teachingFeedback.reason, /sở thích/);
  assert.match(sourceItems(b5)[6].teachingFeedback.reason, /Mi and I = we/);
});

test('C1 keeps five best-response answers and C2 remains one matching classification', async () => {
  const { content:c1 } = await load('c1');
  assert.deepEqual(sourceItems(c1).map(item => item.correctChoiceId), ['B','B','A','A','B']);
  const { content:c2 } = await load('c2');
  const source = sourceItems(c2);
  assert.equal(source.length, 1);
  assert.equal(source[0].type, 'classification');
  assert.deepEqual(Object.fromEntries(source[0].tokens.map(token => [token.id,token.correctGroupId])), { a:'4', b:'1', c:'5', d:'3', e:'2' });
  assert.equal(source[0].digitalAdaptation?.adaptedResponseType, 'classification_matching');
});

test('C3 and E3 keep open production after vocabulary preload', async () => {
  const { content:c3 } = await load('c3');
  assert.equal(sourceItems(c3).length, 5);
  assert.ok(sourceItems(c3).every(item => item.type === 'typing' && item.responseMode === 'open'));
  const { content:e3 } = await load('e3');
  assert.equal(sourceItems(e3).length, 6);
  assert.ok(sourceItems(e3).every(item => item.type === 'typing' && item.responseMode === 'open'));
  assert.match(sourceItems(e3)[5].vi, /about 70 words/);
});

test('D1 uses the exact source word box and answer sequence', async () => {
  const { content } = await load('d1');
  const source = sourceItems(content);
  const bank = ['like','having','your','sending','usually','photo'];
  assert.deepEqual(source.map(item => item.en), ['having','photo','like','usually','sending','your']);
  assert.ok(source.every(item => JSON.stringify(item.sourceWordBank) === JSON.stringify(bank)));
});

test('D2 keeps Mark cloze answer pattern and D3a matching key', async () => {
  const { content:d2 } = await load('d2');
  assert.deepEqual(sourceItems(d2).map(item => item.correctChoiceId), ['A','C','B','A','C','B']);
  assert.equal(correctText(sourceItems(d2)[0]), 'gets');
  assert.equal(correctText(sourceItems(d2)[5]), 'plays');
  const { content:d3a } = await load('d3a');
  const match = sourceItems(d3a)[0];
  assert.equal(match.type, 'classification');
  assert.deepEqual(Object.fromEntries(match.tokens.map(token => [token.id,token.correctGroupId])), { a:'lockdown', b:'beneficial', c:'improve', d:'pandemics', e:'experiences' });
});

test('D3b preserves True False No Information answers F T NI T F with passage evidence', async () => {
  const { content } = await load('d3b');
  const source = sourceItems(content);
  assert.deepEqual(source.map(item => item.correctChoiceId), ['B','A','C','A','B']);
  assert.deepEqual(source.map(correctText), ['False','True','No Information','True','False']);
  assert.ok(source.every(item => item.stimulus?.text?.includes('having a hobby is very beneficial')));
  assert.match(source[2].teachingFeedback.reason, /không nói/);
});

test('E1 preserves five source cue-writing sentences with accepted variants', async () => {
  const { content } = await load('e1');
  const source = sourceItems(content);
  assert.equal(source.length, 5);
  assert.deepEqual(source.map(item => item.en), [
    'I like gardening because I love plants and flowers.',
    'My sister doesn’t like horse riding because she is afraid of horses.',
    'Making models develops your creativity.',
    'Collecting stamps helps you be more patient.',
    'Jogging makes you strong and reduces stress.'
  ]);
  assert.ok(source.slice(1).every(item => item.acceptedAnswers?.length > 0));
});

test('source word-bank enhancer adds G7 U1 D1 while retaining all prior workbook registries', async () => {
  const enhancer = await readFile(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url), 'utf8');
  assert.match(enhancer, /g6U1WorkbookRegistry/);
  assert.match(enhancer, /g6U2WorkbookRegistry/);
  assert.match(enhancer, /g6U3WorkbookRegistry/);
  assert.match(enhancer, /g7U1WorkbookRegistry/);
  assert.match(enhancer, /g7-u1-wb-d1/);
});
