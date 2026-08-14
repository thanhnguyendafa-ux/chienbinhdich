import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonRegistry } from '../src/data/lessonCatalog.js';

test('pronunciation scaffold cannot qualify before all main items are covered', () => {
  const lesson = lessonRegistry.find(entry => entry.id === 'g7-u1-pronunciation-01');
  assert.equal(lesson?.completionPolicy, 'all-items');
});
