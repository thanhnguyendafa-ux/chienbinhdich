import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mcqPrintLayout } from '../src/features/admin/print/mcqPrintLayout.js';

const css = readFileSync(new URL('../styles/lesson-print.css', import.meta.url), 'utf8');

test('adaptive MCQ layout uses four-across, two-column, and stacked modes', () => {
  assert.equal(mcqPrintLayout([
    { text: 'fifty' }, { text: 'sixteen' }, { text: 'ninety' }, { text: 'sixty' }
  ]), 'inline-4');
  assert.equal(mcqPrintLayout([
    { text: 'In a small village.' }, { text: 'In a busy city.' }, { text: 'Near her school.' }, { text: 'In a tall tower.' }
  ]), 'grid-2');
  assert.equal(mcqPrintLayout([
    { text: 'True — because sandwiches are her favourite food and she does not like pizza very much.' },
    { text: 'False — because pizza is her favourite food and the passage clearly says so.' },
    { text: 'True — because table tennis is her favourite sport, which is unrelated evidence.' },
    { text: 'False — because she likes both foods equally according to the passage.' }
  ]), 'stack-1');
});

test('lesson print contract locks A4 portrait, 13pt learner text, white paper, and unsplit ordinary questions', () => {
  assert.match(css, /@page\{size:A4 portrait;margin:10mm\}/);
  assert.match(css, /\.lesson-print-paper\{[^}]*background:#fff[^}]*color:#000[^}]*font-size:13pt/s);
  assert.match(css, /\.lesson-print-question\{[^}]*break-inside:avoid[^}]*page-break-inside:avoid/s);
  assert.match(css, /\.lesson-print-passage p\{[^}]*font-size:13pt/s);
  assert.match(css, /\.lesson-print-choices[^}]*font-size:13pt/s);
});
