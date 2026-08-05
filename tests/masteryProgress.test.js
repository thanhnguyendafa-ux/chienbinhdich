import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMasteryPercent, renderMasteryProgress } from '../src/ui/masteryProgress.js';

test('mastery bar renders exact current geometry and an 80 percent target without inline styles', () => {
  const html = renderMasteryProgress({ value: 6.25, previous: 6.25, threshold: 80, delta: 0 });
  assert.match(html, /aria-valuenow="6\.25"/);
  assert.match(html, /width="6\.25"/);
  assert.match(html, /x1="80" x2="80"/);
  assert.match(html, /Mục tiêu 80%/);
  assert.doesNotMatch(html, /style=/);
});

test('mastery bar can render a visible gain from a previous value', () => {
  const html = renderMasteryProgress({ value: 37.5, previous: 31.25, threshold: 80, delta: 6.25 });
  assert.match(html, /width="31\.25"/);
  assert.match(html, /\+6\.25%/);
  assert.match(html, /data-mastery-state="gain"/);
});

test('mastery bar can render a visible loss and keeps exact quarter-step labels', () => {
  const html = renderMasteryProgress({ value: 31.25, previous: 37.5, threshold: 80, delta: -6.25 });
  assert.match(html, /width="37\.5"/);
  assert.match(html, /−6\.25%/);
  assert.match(html, /data-mastery-state="loss"/);
  assert.equal(formatMasteryPercent(18.75), '18.75');
  assert.equal(formatMasteryPercent(25), '25');
});
