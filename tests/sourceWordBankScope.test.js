import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
import {
  SOURCE_WORD_BANK_REFERENCE_IDS,
  sourceWordBankConfigForPrompt
} from '../src/features/drill/sourceWordBankEnhancer.js';

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
const normalized = value => String(value ?? '').replace(/\s+/g,' ').trim();
const enhancerSource = readFileSync(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url),'utf8');

test('G7 U2 B3 tofu vocabulary preload does not inherit the source exercise word bank', async () => {
  const rawDescriptor = g7U2WorkbookRegistry.find(entry => entry.id === 'g7-u2-wb-b3');
  assert.ok(rawDescriptor);
  const content = await rawDescriptor.loadContent();
  assert.equal(content.items.length,14);

  const tofuVocab = content.items.find(item => !item.sourceWordBank && /tofu/i.test(questionPromptDisplay(item)));
  assert.ok(tofuVocab,'expected the tofu vocabulary preload item');
  assert.equal(sourceWordBankConfigForPrompt(content, questionPromptDisplay(tofuVocab)),null);

  const bankItem = content.items.find(item => Array.isArray(item.sourceWordBank) && item.sourceWordBank.length);
  assert.ok(bankItem,'expected the source item that owns the word bank');
  const config = sourceWordBankConfigForPrompt(content, questionPromptDisplay(bankItem));
  assert.ok(config);
  assert.equal(config.itemId,bankItem.id);
  assert.deepEqual(config.words,['tofu','fit','chapped lips','weight','harms','bins']);
});

test('every audited word-bank lesson resolves a bank only from the item prompt that owns it', async () => {
  for (const id of SOURCE_WORD_BANK_REFERENCE_IDS) {
    const descriptor = workbookRegistry.find(entry => entry.id === id);
    assert.ok(descriptor,`${id}: descriptor missing`);
    const content = await descriptor.loadContent();
    const bankItems = content.items.filter(item => Array.isArray(item.sourceWordBank) && item.sourceWordBank.length);
    assert.ok(bankItems.length > 0,`${id}: no sourceWordBank item`);

    for (const item of bankItems) {
      const config = sourceWordBankConfigForPrompt(content, questionPromptDisplay(item));
      assert.ok(config,`${id}/${item.id}: owning prompt did not resolve`);
      assert.equal(config.itemId,item.id);
      assert.deepEqual(config.words,item.sourceWordBank);
    }

    const bankPrompts = new Set(bankItems.map(item => normalized(questionPromptDisplay(item))));
    for (const item of content.items.filter(item => !item.sourceWordBank)) {
      const prompt = normalized(questionPromptDisplay(item));
      if (!prompt || bankPrompts.has(prompt)) continue;
      assert.equal(sourceWordBankConfigForPrompt(content,prompt),null,`${id}/${item.id}: bank leaked to non-owner item`);
    }
  }
});

test('published G7 U2 B3 keeps the same 14-item all-items Mastery contract', async () => {
  const published = lessonRegistry.find(entry => entry.id === 'g7-u2-wb-b3');
  assert.ok(published);
  assert.equal(published.passThreshold,80);
  assert.equal(published.assessmentPolicy,'workbook-all-items-v1');
  assert.equal(published.completionPolicy,'all-items');
  const content = await published.loadContent();
  assert.equal(content.items.length,14);
});

test('word-bank runtime guards async races and reconciles duplicate or stale panels', () => {
  assert.match(enhancerSource,/new WeakSet\(\)/);
  assert.match(enhancerSource,/sourceWordBankConfigForPrompt/);
  assert.match(enhancerSource,/reconcileWordBanks/);
  assert.match(enhancerSource,/banks = \[\.\.\.promptBlock\.querySelectorAll\('\.source-word-bank'\)\]/);
  assert.match(enhancerSource,/currentPrompt !== renderedPrompt/);
  assert.doesNotMatch(enhancerSource,/content\.items\?\.find\(candidate => Array\.isArray\(candidate\.sourceWordBank\)/);
});
