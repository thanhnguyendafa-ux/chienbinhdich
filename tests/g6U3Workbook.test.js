import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U3WorkbookFolders, g6U3WorkbookRegistry } from '../src/data/g6-u3-workbook-catalog.js';

const expectedKeys = ['a2','b1','b2','b3','b4','b5','b6','c1','c3','d1','d2','d3','e1','e2','e3'];
const omittedSlugs = ['g6-u3-wb-a1','g6-u3-wb-c2'];

async function load(key) {
  const descriptor = g6U3WorkbookRegistry.find(entry => entry.id === `g6-u3-wb-${key}`);
  assert.ok(descriptor, `missing descriptor ${key}`);
  return { descriptor, content: await descriptor.loadContent() };
}

function correctChoiceText(item) {
  return item.choices.find(choice => choice.id === item.correctChoiceId)?.text ?? '';
}

function yesWords(item) {
  return item.tokens.filter(token => token.correctGroupId === 'yes').map(token => token.text);
}

test('G6 U3 workbook publishes exactly 15 approved text-based lessons under a new Unit 3 folder', () => {
  assert.deepEqual(g6U3WorkbookFolders.map(folder => folder.id), ['global6-unit3','global6-unit3-workbook']);
  assert.equal(g6U3WorkbookFolders[0].parentId, 'global6');
  assert.equal(g6U3WorkbookFolders[1].parentId, 'global6-unit3');
  assert.deepEqual(g6U3WorkbookRegistry.map(entry => entry.id), expectedKeys.map(key => `g6-u3-wb-${key}`));
  for (const slug of omittedSlugs) assert.equal(g6U3WorkbookRegistry.some(entry => entry.lessonSlug === slug), false);
});

test('every G6 U3 workbook lesson has required micro-theory, feedback and valid content', async () => {
  for (const descriptor of g6U3WorkbookRegistry) {
    const content = await descriptor.loadContent();
    assert.equal(content.preLessonTheory?.required, true, `${descriptor.id} missing theory`);
    assert.ok(content.preLessonTheory?.title?.startsWith('Nhắc nhanh'), `${descriptor.id} theory title`);
    assert.ok(content.preLessonTheory?.sections?.length > 0, `${descriptor.id} theory sections`);
    assert.equal(content.items.length, descriptor.itemCount, `${descriptor.id} item count`);
    assert.deepEqual(validateSet({ ...descriptor, ...content }), [], `${descriptor.id} validation`);
    for (const item of content.items) {
      assert.equal(item.theorySupport?.access, 'after_submit', `${item.id} feedback must stay after submit`);
      assert.ok(item.teachingFeedback?.reason?.length > 15, `${item.id} missing child-friendly reason`);
    }
  }
});

test('A2 keeps pronunciation as self-confirmed practice instead of pretending to grade audio', async () => {
  const { content } = await load('a2');
  assert.equal(content.items.length, 3);
  assert.ok(content.items.every(item => item.type === 'typing' && item.responseMode === 'open'));
  assert.ok(content.items.every(item => item.typingUi?.instruction?.includes('không chấm phát âm bằng micro')));
  assert.match(content.items[0].vi, /Plain bun, plum bun/);
  assert.match(content.items[1].vi, /The big bug bit the big bear/);
  assert.match(content.items[2].vi, /Picky people pick plain peanut butter/);
});

test('B1 preserves source overlap by splitting the three table columns into three classifications', async () => {
  const { content } = await load('b1');
  assert.equal(content.items.length, 3);
  assert.ok(content.items.every(item => item.type === 'classification'));
  assert.deepEqual(yesWords(content.items[0]), ['big','long','small','short','strong','weak']);
  assert.deepEqual(yesWords(content.items[1]), ['arms','legs','shoulders','hands','eyes','feet','ears','hair','head']);
  assert.deepEqual(yesWords(content.items[2]), ['big','small','fast','short','cute','strong','weak','smart','tall','slim','sporty']);
  for (const word of ['big','small','short','strong','weak']) {
    assert.ok(yesWords(content.items[0]).includes(word));
    assert.ok(yesWords(content.items[2]).includes(word));
  }
  assert.ok(content.items.every(item => item.digitalAdaptation?.sourceResponseType === 'three_column_table_with_overlap'));
});

test('B2 and B3 keep the adjective corpus and B3 source word bank', async () => {
  const { content:b2 } = await load('b2');
  assert.deepEqual(b2.items.map(item => item.en), ['careful','creative','kind','loving','hard-working','shy']);
  const { content:b3 } = await load('b3');
  assert.deepEqual(b3.items.map(item => item.en), ['creative','careful','shy','kind','loving']);
  const bank = ['careful','creative','kind','loving','hard-working','shy'];
  assert.ok(b3.items.every(item => JSON.stringify(item.sourceWordBank) === JSON.stringify(bank)));
});

test('B4 and B5 keep all workbook verb blanks and meaning-based tense answers', async () => {
  const { content:b4 } = await load('b4');
  assert.deepEqual(b4.items.map(item => item.en), ['is taking','is helping','is knocking','Are','doing','am writing','is','talking','Are','reading']);
  const { content:b5 } = await load('b5');
  assert.deepEqual(b5.items.map(item => item.en), ['is','is wearing','is playing','likes','are','is looking','smiling']);
  assert.match(b5.items[2].teachingFeedback.reason, /Look! \+ now/);
  assert.match(b5.items[3].teachingFeedback.reason, /sở thích/);
});

test('B6 converts six fixed long sentence answers to deterministic four-choice MCQ', async () => {
  const { descriptor, content } = await load('b6');
  assert.deepEqual(descriptor.activityTypes, ['mcq']);
  assert.deepEqual(content.items.map(item => item.correctChoiceId), ['C','B','D','A','C','B']);
  assert.equal(correctChoiceText(content.items[0]), 'Our grandparents are watching TV in the living room.');
  assert.equal(correctChoiceText(content.items[5]), 'What are you doing? I am writing a poem.');
  for (const item of content.items) {
    assert.equal(item.choices.length, 4);
    assert.ok(item.choices.every(choice => choice.preserveOrder === true));
    assert.equal(item.digitalAdaptation?.sourceResponseType, 'written_sentence');
    assert.equal(item.digitalAdaptation?.adaptedResponseType, 'mcq');
  }
});

test('C1 teaches look like versus be like, keeps five fixed cues as MCQ and final conversation open', async () => {
  const { descriptor, content } = await load('c1');
  assert.deepEqual(descriptor.activityTypes, ['mcq','typing']);
  assert.deepEqual(content.items.slice(0, 5).map(item => item.correctChoiceId), ['B','D','A','C','B']);
  assert.equal(correctChoiceText(content.items[0]), 'What does your sister look like?');
  assert.equal(correctChoiceText(content.items[2]), 'What is she like?');
  assert.equal(content.items[5].type, 'typing');
  assert.equal(content.items[5].responseMode, 'open');
});

test('C3, D2 and E3 remain open production', async () => {
  for (const key of ['c3','d2','e3']) {
    const { content } = await load(key);
    assert.ok(content.items.every(item => item.type === 'typing' && item.responseMode === 'open'), key);
  }
  const { content:d2 } = await load('d2');
  assert.match(d2.items[0].vi, /good friends are reliable/);
  const { content:e3 } = await load('e3');
  assert.match(e3.items[0].vi, /about 70 words/);
});

test('D1 uses the exact six-word source bank and answer sequence', async () => {
  const { content } = await load('d1');
  const bank = ['funny','is','kind','time','cook','hair'];
  assert.deepEqual(content.items.map(item => item.en), ['is','hair','cook','kind','funny','time']);
  assert.ok(content.items.every(item => JSON.stringify(item.sourceWordBank) === JSON.stringify(bank)));
});

test('D3 keeps all five source statements and the correct set 1, 3, 5 through binary MCQ adaptation', async () => {
  const { content } = await load('d3');
  assert.deepEqual(content.items.map(item => item.correctChoiceId), ['A','B','A','B','A']);
  assert.deepEqual(content.items.filter(item => item.correctChoiceId === 'A').map(item => item.id), ['g6-u3-wb-d3-01','g6-u3-wb-d3-03','g6-u3-wb-d3-05']);
  assert.ok(content.items.every(item => item.digitalAdaptation?.sourceResponseType === 'circle_all_correct_statements'));
  assert.ok(content.items.every(item => item.choices.length === 2));
  assert.match(content.items[1].teachingFeedback.reason, /never lie/);
  assert.match(content.items[3].teachingFeedback.reason, /Not necessarily/);
});

test('E1 and E2 preserve the writing model structure and source mappings', async () => {
  const { content:e1 } = await load('e1');
  const map = Object.fromEntries(e1.items[0].tokens.map(token => [token.id, token.correctGroupId]));
  assert.deepEqual(map, { a:'beginning', b:'middle', c:'middle', d:'end' });
  assert.match(e1.items[0].prompt, /best friend, Mai/);

  const { content:e2 } = await load('e2');
  assert.deepEqual(e2.items.map(item => item.correctChoiceId), ['A','C','B','B','B','C','D']);
  assert.ok(e2.items.every(item => item.stimulus?.text?.includes("we've been together for three years")));
});

test('no fixed long typing answer remains where machine-graded recognition is the goal', async () => {
  for (const descriptor of g6U3WorkbookRegistry) {
    const content = await descriptor.loadContent();
    for (const item of content.items) {
      if (item.type !== 'typing' || item.responseMode === 'open') continue;
      assert.ok(String(item.en ?? '').length <= 20, `${item.id} fixed typing answer is too long: ${item.en}`);
    }
  }
});

test('source word-bank enhancer includes Unit 3 B3 and D1 while retaining earlier workbooks', async () => {
  const enhancer = await readFile(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url), 'utf8');
  assert.match(enhancer, /g6U1WorkbookRegistry/);
  assert.match(enhancer, /g6U2WorkbookRegistry/);
  assert.match(enhancer, /g6U3WorkbookRegistry/);
  assert.match(enhancer, /g6-u3-wb-b3/);
  assert.match(enhancer, /g6-u3-wb-d1/);
  assert.match(enhancer, /g6-u2-wb-d1/);
});
