import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U2WorkbookFolders, g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';

const expectedKeys = ['a1','a2','b3','b4','c1','c2','c3','d1','d2','d3b','e1','e2'];
const omittedSlugs = ['g6-u2-wb-b1','g6-u2-wb-b2','g6-u2-wb-b5','g6-u2-wb-d3a','g6-u2-wb-e3'];

async function load(key) {
  const descriptor = g6U2WorkbookRegistry.find(entry => entry.id === `g6-u2-wb-${key}`);
  assert.ok(descriptor, `missing descriptor ${key}`);
  return { descriptor, content: await descriptor.loadContent() };
}

function choiceText(item, id = item.correctChoiceId) {
  return item.choices?.find(choice => choice.id === id)?.text ?? '';
}

test('G6 U2 workbook publishes exactly the 12 approved text-based source lessons', () => {
  assert.equal(g6U2WorkbookFolders.length, 1);
  assert.equal(g6U2WorkbookFolders[0].id, 'global6-unit2-workbook');
  assert.equal(g6U2WorkbookFolders[0].parentId, 'global6-unit2');
  assert.deepEqual(g6U2WorkbookRegistry.map(entry => entry.id), expectedKeys.map(key => `g6-u2-wb-${key}`));
  assert.deepEqual(g6U2WorkbookRegistry.map(entry => entry.lessonSlug), expectedKeys.map(key => `g6-u2-wb-${key}`));
  for (const slug of omittedSlugs) assert.equal(g6U2WorkbookRegistry.some(entry => entry.lessonSlug === slug), false);
});

test('every G6 U2 workbook lesson has required micro-theory and valid content', async () => {
  for (const descriptor of g6U2WorkbookRegistry) {
    const content = await descriptor.loadContent();
    assert.equal(content.preLessonTheory?.required, true, `${descriptor.id} missing required theory`);
    assert.ok(content.preLessonTheory?.title?.startsWith('Nhắc nhanh'), `${descriptor.id} theory title`);
    assert.ok(Array.isArray(content.preLessonTheory?.sections) && content.preLessonTheory.sections.length > 0, `${descriptor.id} theory sections`);
    assert.equal(content.items.length, descriptor.itemCount, `${descriptor.id} item count`);
    assert.deepEqual(validateSet({ ...descriptor, ...content }), [], `${descriptor.id} validation`);
    for (const item of content.items) {
      assert.equal(item.theorySupport?.access, 'after_submit', `${item.id} feedback theory must stay after submit`);
      assert.ok(item.teachingFeedback?.reason, `${item.id} missing Vietnamese reason`);
    }
  }
});

test('A1, B3, B4, C1 and C2 retain the workbook answer key', async () => {
  const { content:a1 } = await load('a1');
  const soundByWord = Object.fromEntries(a1.items[0].tokens.map(token => [token.text, token.correctGroupId]));
  assert.deepEqual(soundByWord, { beds:'z', caps:'s', posters:'z', clocks:'s', villas:'z', lights:'s' });

  const { content:b3 } = await load('b3');
  assert.deepEqual(b3.items.map(item => item.correctChoiceId), ['C','B','D','D','A']);

  const { content:b4 } = await load('b4');
  assert.deepEqual(b4.items.map(item => item.en), ["Mai's","Nam's","grandmother's","cousin's","Tom's","sister's"]);

  const { content:c1 } = await load('c1');
  assert.deepEqual(c1.items[0].correctOrder, ['C','A','E','B','D']);

  const { content:c2 } = await load('c2');
  assert.deepEqual(c2.items.map(item => item.correctChoiceId), ['C','E','B','D','A']);
  assert.ok(c2.items.every(item => item.choices.every(choice => choice.preserveOrder === true)));
});

test('D1 uses source word box as direct choices and D2 keeps A/B/C order', async () => {
  const { content:d1 } = await load('d1');
  const expectedBank = ['untidy','are','not','near','next','on','his','school bag'];
  assert.ok(d1.items.every(item => item.type === 'mcq'));
  assert.deepEqual(d1.items[0].sourceWordBank, expectedBank);
  assert.ok(d1.items.every(item => JSON.stringify(item.sourceWordBank) === JSON.stringify(expectedBank)));
  assert.deepEqual(d1.items.map(choiceText), ['are','near','on','school bag','next','untidy','not','his']);

  const { content:d2 } = await load('d2');
  assert.deepEqual(d2.items.map(item => item.correctChoiceId), ['B','B','C','A','C','B']);
  assert.ok(d2.items.every(item => item.choices.every(choice => choice.preserveOrder === true)));
});

test('C3 uses sentence order for six fixed cue-built lines and keeps final conversation open', async () => {
  const { descriptor, content } = await load('c3');
  assert.deepEqual(descriptor.activityTypes, ['sentence_order','typing']);
  assert.ok(content.items.slice(0, 6).every(item => item.type === 'sentence_order'));
  assert.deepEqual(content.items[0].correctOrder, ['Mira,','who','do','you','live','with?']);
  assert.deepEqual(content.items[5].correctOrder, ["No, it isn't.",'There is','a living room,','two bedrooms,','a bathroom','and a kitchen.']);
  assert.ok(content.items[0].tokens.includes('does'));
  const open = content.items[6];
  assert.equal(open.type, 'typing');
  assert.equal(open.responseMode, 'open');
});

test('D3b reading keeps deterministic A/B/C/D answers with source-grounded traps', async () => {
  const { descriptor, content } = await load('d3b');
  assert.deepEqual(descriptor.activityTypes, ['mcq']);
  assert.deepEqual(content.items.map(item => item.correctChoiceId), ['B','D','A','C','B']);
  assert.equal(choiceText(content.items[0]), 'It is big and cozy.');
  assert.match(choiceText(content.items[1]), /three posters/);
  assert.doesNotMatch(choiceText(content.items[1]), /table/i);
  assert.match(choiceText(content.items[3]), /comfortable/);
  assert.match(choiceText(content.items[4]), /cozy/);
});

test('E1 fixed sentence rewrites use sentence order with distractors', async () => {
  const { descriptor, content } = await load('e1');
  assert.deepEqual(descriptor.activityTypes, ['sentence_order']);
  assert.ok(content.items.every(item => item.type === 'sentence_order'));
  assert.deepEqual(content.items[0].correctOrder, ["There isn't",'a bookshelf','in my bedroom.']);
  assert.deepEqual(content.items[2].correctOrder, ["Mai's notebook",'is','on the table.']);
  assert.deepEqual(content.items[3].correctOrder, ['The microwave','is','behind','the dog.']);
  assert.deepEqual(content.items[4].correctOrder, ['I like','the living room','best','in the house.']);
  assert.ok(content.items[0].tokens.includes("There aren't"));
});

test('open production stays open and no fixed long typing answer remains in the Unit 2 workbook', async () => {
  const { content:a2 } = await load('a2');
  const { content:c3 } = await load('c3');
  const { content:e2 } = await load('e2');
  assert.ok(a2.items.every(item => item.responseMode === 'open'));
  assert.equal(c3.items.at(-1).responseMode, 'open');
  assert.ok(e2.items.every(item => item.responseMode === 'open'));

  for (const descriptor of g6U2WorkbookRegistry) {
    const content = await descriptor.loadContent();
    for (const item of content.items) {
      if (item.type !== 'typing' || item.responseMode === 'open') continue;
      assert.ok(String(item.en ?? '').length <= 20, `${item.id} still has a fixed long typing answer: ${item.en}`);
    }
  }
});

test('source word-bank enhancer includes Unit 2 D1 without changing earlier support', async () => {
  const enhancer = await readFile(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url), 'utf8');
  assert.match(enhancer, /g6U1WorkbookRegistry/);
  assert.match(enhancer, /g6U2WorkbookRegistry/);
  assert.match(enhancer, /g6-u2-wb-d1/);
  assert.match(enhancer, /g6-u1-wb-b5/);
  assert.match(enhancer, /g6-u1-wb-d1/);
});

test('required micro-theory can unlock immediately when its content fits without scrolling', async () => {
  const gate = await readFile(new URL('../src/features/drill/renderTheoryGate.js', import.meta.url), 'utf8');
  assert.match(gate, /requestAnimationFrame\(updateProgress\)/);
  assert.match(gate, /else updateProgress\(\)/);
});