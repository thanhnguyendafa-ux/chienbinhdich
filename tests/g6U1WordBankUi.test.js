import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { renderQuestionInteraction } from '../src/features/drill/questionTypeRegistry.js';

const B5_BANK = ['ball games','have','English lessons','international','housework','subjects','share','study'];
const D1_BANK = ['their','begins','on','go','off','school','all','learn'];
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const rendererSource = readFileSync(new URL('../src/features/drill/sourceWordBankRenderer.js', import.meta.url), 'utf8');
const wordBankCss = readFileSync(new URL('../styles/source-word-bank.css', import.meta.url), 'utf8');
function correctChoiceText(item) { return item.choices.find(choice => choice.id === item.correctChoiceId)?.text ?? ''; }
const firstSourceItem = content => content.items.find(item => item.learningPhase === 'source');
const bankCount = html => (html.match(/class="source-word-bank"/g) ?? []).length;

test('B5 exposes the exact SBT word bank in source order and uses direct word-bank choice', async () => {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-b5');
  const item = firstSourceItem(await descriptor.loadContent());
  assert.equal(item.type,'mcq'); assert.deepEqual(item.sourceWordBank,B5_BANK);
  assert.equal(item.sourceWordBankLabel,'Từ / cụm từ cho sẵn'); assert.equal(correctChoiceText(item),'English lessons');
  assert.match(item.prompt,/^Word box:|^1\. Do you have/);
});

test('D1 exposes the exact SBT word bank in source order and uses direct word-bank choice', async () => {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-d1');
  const item = firstSourceItem(await descriptor.loadContent());
  assert.equal(item.type,'mcq'); assert.deepEqual(item.sourceWordBank,D1_BANK);
  assert.equal(item.sourceWordBankLabel,'Từ / cụm từ cho sẵn'); assert.equal(correctChoiceText(item),'go');
  assert.match(item.stimulus?.text ?? '',/In England, when the schoolchildren come to school/);
});

test('word bank renders from the current item only: source gets one, preload without metadata gets zero', async () => {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-b5');
  const content = await descriptor.loadContent();
  const source = firstSourceItem(content);
  const preload = content.items.find(item => item.learningPhase !== 'source' && !item.sourceWordBank?.length);
  assert.equal(bankCount(renderQuestionInteraction(source)),1);
  assert.match(renderQuestionInteraction(source),/data-source-word-bank-item-id=/);
  assert.ok(preload,'expected a preload item without word-bank metadata');
  assert.equal(bankCount(renderQuestionInteraction(preload)),0);
});

test('word-bank UI is structured current-item metadata with no DOM reverse lookup runtime', () => {
  assert.match(rendererSource,/item\?\.sourceWordBank/);
  assert.doesNotMatch(rendererSource,/MutationObserver|location|querySelector|WorkbookRegistry/);
  assert.doesNotMatch(indexHtml,/sourceWordBankEnhancer/);
});

test('app shell keeps the dedicated non-interactive word-bank visual layer', () => {
  assert.match(indexHtml,/styles\/source-word-bank\.css/);
  assert.match(wordBankCss,/\.source-word-bank-grid/); assert.match(wordBankCss,/gap:/); assert.match(wordBankCss,/\.source-word-bank-item/);
  assert.match(wordBankCss,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});