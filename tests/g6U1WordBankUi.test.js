import test from 'node:test';
import assert from 'node:assert/strict';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { parseSourceWordBank } from '../src/features/drill/sourceWordBankEnhancer.js';

const B5_BANK = ['ball games', 'have', 'English lessons', 'international', 'housework', 'subjects', 'share', 'study'];
const D1_BANK = ['their', 'begins', 'on', 'go', 'off', 'school', 'all', 'learn'];

test('B5 exposes the exact SBT word bank in source order while staying typing', async () => {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-b5');
  const content = await descriptor.loadContent();
  const item = content.items[0];

  assert.equal(item.type, 'typing');
  assert.deepEqual(item.sourceWordBank, B5_BANK);
  assert.equal(item.en, 'English lessons');
  const parsed = parseSourceWordBank(item.vi);
  assert.deepEqual(parsed.items, B5_BANK);
  assert.match(parsed.prompt, /^1\. Do you have/);
  assert.doesNotMatch(parsed.prompt, /^Word box:/i);
});

test('D1 exposes the exact SBT word bank in source order while staying typing', async () => {
  const descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-d1');
  const content = await descriptor.loadContent();
  const item = content.items[0];

  assert.equal(item.type, 'typing');
  assert.deepEqual(item.sourceWordBank, D1_BANK);
  assert.equal(item.en, 'go');
  const parsed = parseSourceWordBank(item.vi);
  assert.deepEqual(parsed.items, D1_BANK);
  assert.match(parsed.prompt, /In England, when the schoolchildren come to school/);
});

test('word-bank parser ignores ordinary typing prompts', () => {
  assert.equal(parseSourceWordBank('Where does Ms Lan live?'), null);
});
