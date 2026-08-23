import test from 'node:test';
import assert from 'node:assert/strict';
import { questionPromptDisplay } from '../src/core/questionTypes.js';
import { lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { g5WorkbookRegistry } from '../src/data/workbooks/g5/index.js';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { g6U2WorkbookRegistry } from '../src/data/g6-u2-workbook-catalog.js';
import { g6U3WorkbookRegistry } from '../src/data/g6-u3-workbook-catalog.js';
import { g6WorkbookRemainingRegistry } from '../src/data/workbooks/g6/index.js';
import { g7U1WorkbookRegistry } from '../src/data/g7-u1-workbook-catalog.js';
import { g7U2WorkbookRegistry } from '../src/data/g7-u2-workbook-catalog.js';
import { g7U3WorkbookRegistry } from '../src/data/g7-u3-workbook-catalog.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';

const SOURCE_WORD_BANK_REFERENCE_IDS = Object.freeze([
  'g6-u1-wb-b5','g6-u1-wb-d1',
  'g6-u2-wb-d1',
  'g6-u3-wb-b3','g6-u3-wb-d1',
  'g7-u1-wb-d1',
  'g7-u2-wb-b3','g7-u2-wb-b4',
  'g7-u3-wb-b3'
]);
const workbookRegistry = [
  ...g5WorkbookRegistry,
  ...g6U1WorkbookRegistry,
  ...g6U2WorkbookRegistry,
  ...g6U3WorkbookRegistry,
  ...g6WorkbookRemainingRegistry,
  ...g7U1WorkbookRegistry,
  ...g7U2WorkbookRegistry,
  ...g7U3WorkbookRegistry
];
const bankCount = html => (html.match(/class="source-word-bank"/g) ?? []).length;

test('G7 U2 B3 tofu vocabulary preload does not inherit the source exercise word bank', async () => {
  const rawDescriptor = g7U2WorkbookRegistry.find(entry => entry.id === 'g7-u2-wb-b3');
  assert.ok(rawDescriptor);
  const content = await rawDescriptor.loadContent();
  assert.equal(content.items.length,14);

  const tofuVocab = content.items.find(item => !item.sourceWordBank && /tofu/i.test(questionPromptDisplay(item)));
  assert.ok(tofuVocab,'expected the tofu vocabulary preload item');
  assert.equal(bankCount(renderQuestionInteraction(tofuVocab)),0);

  const bankItem = content.items.find(item => Array.isArray(item.sourceWordBank) && item.sourceWordBank.length);
  assert.ok(bankItem,'expected the source item that owns the word bank');
  const html = renderQuestionInteraction(bankItem);
  assert.equal(bankCount(html),1);
  assert.match(html,new RegExp(`data-source-word-bank-item-id="${bankItem.id}"`));
  for (const word of ['tofu','fit','chapped lips','weight','harms','bins']) assert.match(html,new RegExp(word));
});

test('every audited word-bank lesson renders exactly one bank for owners and zero for non-owners', async () => {
  for (const id of SOURCE_WORD_BANK_REFERENCE_IDS) {
    const descriptor = workbookRegistry.find(entry => entry.id === id);
    assert.ok(descriptor,`${id}: descriptor missing`);
    const content = await descriptor.loadContent();
    const bankItems = content.items.filter(item => Array.isArray(item.sourceWordBank) && item.sourceWordBank.length);
    assert.ok(bankItems.length > 0,`${id}: no sourceWordBank item`);

    for (const item of bankItems) {
      assert.equal(bankCount(renderQuestionInteraction(item)),1,`${id}/${item.id}: owner must render one bank`);
    }
    for (const item of content.items.filter(item => !item.sourceWordBank?.length)) {
      assert.equal(bankCount(renderQuestionInteraction(item)),0,`${id}/${item.id}: bank leaked to non-owner item`);
    }
  }
});

test('published G7 U2 B3 keeps 14 all-items units and upgrades to reversible contract v2', async () => {
  const published = lessonRegistry.find(entry => entry.id === 'g7-u2-wb-b3');
  assert.ok(published);
  assert.equal(published.passThreshold,80);
  assert.equal(published.assessmentPolicy,'workbook-all-items-v1');
  assert.equal(published.assessmentContractVersion,2);
  assert.equal(published.completionPolicy,'all-items');
  const content = await published.loadContent();
  assert.equal(content.items.length,14);
});
