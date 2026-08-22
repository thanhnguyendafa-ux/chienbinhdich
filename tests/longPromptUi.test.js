import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { g6U1WorkbookRegistry } from '../src/data/g6-u1-workbook-catalog.js';
import { LONG_PROMPT_CHAR_THRESHOLD, LONG_PROMPT_WORD_THRESHOLD, isLongPromptText } from '../src/features/drill/longPromptEnhancer.js';

const firstSourceItem = content => content.items.find(item => item.learningPhase === 'source');

test('long-prompt classifier is generic and leaves short questions unchanged', () => {
  assert.equal(LONG_PROMPT_WORD_THRESHOLD,36); assert.equal(LONG_PROMPT_CHAR_THRESHOLD,240);
  assert.equal(isLongPromptText('Where does Ms Lan live?'),false);
  assert.equal(isLongPromptText('Do you have ______ on Monday? - No, on Tuesday.'),false);
  assert.equal(isLongPromptText(Array.from({ length:36 }, (_, index) => `word${index + 1}`).join(' ')),true);
});

test('G6 U1 D1 keeps its long reading text as a stimulus while source question stays compact', async () => {
  const d1Descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-d1');
  const b5Descriptor = g6U1WorkbookRegistry.find(entry => entry.id === 'g6-u1-wb-b5');
  const d1Item = firstSourceItem(await d1Descriptor.loadContent());
  const b5Item = firstSourceItem(await b5Descriptor.loadContent());
  assert.equal(isLongPromptText(d1Item.stimulus?.text),true);
  assert.equal(isLongPromptText(d1Item.prompt),false);
  assert.equal(isLongPromptText(b5Item.prompt),false);
});

test('desktop long prompts are exactly 13pt and the override loads after the academic theme', async () => {
  const [css, html, enhancer] = await Promise.all([
    readFile(new URL('../styles/long-prompt.css', import.meta.url), 'utf8'),
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/features/drill/longPromptEnhancer.js', import.meta.url), 'utf8')
  ]);
  assert.match(css,/@media \(min-width:641px\)[\s\S]*\.question-card \.prompt-block\.is-long-prompt h1[\s\S]*font-size:13pt/);
  assert.ok(html.indexOf('/styles/long-prompt.css') > html.indexOf('/styles/academic-theme.css'));
  assert.match(html,/\/src\/features\/drill\/longPromptEnhancer\.js/);
  assert.doesNotMatch(enhancer,/g6-u1-wb-d1|g6-u1-wb-b5/);
});