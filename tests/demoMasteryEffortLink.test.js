import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { resolveEffortPassPolicy } from '../src/core/effortPassPolicy.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const DEMO_ID = 'demo-mastery-effort-10';

test('published demo exposes Mastery 80% OR Effort 10-minute contract on a fixed link', async () => {
  const descriptor = lessonRegistry.find(item => item.id === DEMO_ID);
  assert.ok(descriptor, 'Demo lesson must be published.');
  assert.equal(descriptor.lessonSlug, 'demo-mastery-effort-10');
  assert.equal(descriptor.passThreshold, 80);
  assert.equal(descriptor.effortPassEnabled, true);
  assert.equal(descriptor.effortPassMinutes, 10);

  const lesson = await loadLessonSet(DEMO_ID);
  const effort = resolveEffortPassPolicy(lesson);
  assert.equal(lesson.passThreshold, 80);
  assert.equal(effort.enabled, true);
  assert.equal(effort.minutes, 10);
  assert.equal(lesson.items.length, 10);
});
