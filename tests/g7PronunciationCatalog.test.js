import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonRegistry } from '../src/data/lessonCatalog.js';

const lesson = lessonRegistry.find(entry => entry.id === 'g7-u1-pronunciation-01');

test('G7 Unit 1 pronunciation lesson is registered under the Unit 1 folder', async () => {
  assert.ok(lesson);
  assert.equal(lesson.folderId, 'global7-unit1');
  assert.equal(lesson.completionPolicy, 'all-items');
  assert.deepEqual(lesson.activityTypes, ['mcq', 'true_false', 'classification']);
  assert.equal(lesson.itemCount, 17);
  const content = await lesson.loadContent();
  assert.equal(content.items.length, 17);
});

test('G7 pronunciation print groups preserve the three-stage learning flow', () => {
  assert.deepEqual(lesson.printGroups.map(group => group.title), [
    'A. BUILD THE FOUNDATION / XÂY NỀN',
    'B. GUIDED REASONING / SUY LUẬN CÓ HƯỚNG DẪN',
    'C. SOUND CLASSIFICATION / PHÂN LOẠI ÂM'
  ]);
});
