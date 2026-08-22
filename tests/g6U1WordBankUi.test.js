import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';

const B5_BANK = ['ball games', 'have', 'English lessons', 'international', 'housework', 'subjects', 'share', 'study'];
const D1_BANK = ['their', 'begins', 'on', 'go', 'off', 'school', 'all', 'learn'];

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const enhancerSource = readFileSync(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url), 'utf8');
const wordBankCss = readFileSync(new URL('../styles/source-word-bank.css', import.meta.url), 'utf8');

function correctChoiceText(item) {
  return item.choices.find(choice => choice.id === item.correctChoiceId)?.text ?? '';
}

test('B5 exposes the exact SBT word bank in source order and uses direct word-bank choice', async () => {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-b5');
  const content = await descriptor.loadContent();
  const item = content.items[0];

  assert.equal(item.type, 'mcq');
  assert.deepEqual(item.sourceWordBank, B5_BANK);
  assert.equal(item.sourceWordBankLabel, 'Từ / cụm từ cho sẵn');
  assert.equal(correctChoiceText(item), 'English lessons');
  assert.match(item.prompt, /^Word box:|^1\. Do you have/);
});

test('D1 exposes the exact SBT word bank in source order and uses direct word-bank choice', async () => {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-d1');
  const content = await descriptor.loadContent();
  const item = content.items[0];

  assert.equal(item.type, 'mcq');
  assert.deepEqual(item.sourceWordBank, D1_BANK);
  assert.equal(item.sourceWordBankLabel, 'Từ / cụm từ cho sẵn');
  assert.equal(correctChoiceText(item), 'go');
  assert.match(item.stimulus?.text ?? '', /In England, when the schoolchildren come to school/);
});

test('word-bank UI remains structured metadata instead of parsing prompt text', () => {
  assert.match(enhancerSource, /g6-u1-wb-b5/);
  assert.match(enhancerSource, /g6-u1-wb-d1/);
  assert.match(enhancerSource, /sourceWordBank/);
  assert.doesNotMatch(enhancerSource, /WORD_BANK_PREFIX|split\(['\"]·['\"]\)/);
});

test('app shell loads the dedicated non-interactive word-bank visual layer', () => {
  assert.match(indexHtml, /styles\/source-word-bank\.css/);
  assert.match(indexHtml, /src\/features\/drill\/sourceWordBankEnhancer\.js/);
  assert.match(wordBankCss, /\.source-word-bank-grid/);
  assert.match(wordBankCss, /gap:/);
  assert.match(wordBankCss, /\.source-word-bank-item/);
  assert.match(wordBankCss, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});