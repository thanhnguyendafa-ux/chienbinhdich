import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonRegistry } from '../src/data/lessonCatalog.js';

test('pronunciation print groups cover all 17 items in order', () => {
  const lesson = lessonRegistry.find(entry => entry.id === 'g7-u1-pronunciation-01');
  const ids = lesson?.printGroups?.flatMap(group => [...group.itemIds]) ?? [];
  assert.deepEqual(ids, Array.from({ length: 17 }, (_, index) => `g7u1-pr-q${String(index + 1).padStart(2, '0')}`));
});
