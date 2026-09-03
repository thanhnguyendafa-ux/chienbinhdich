import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { validateSet } from '../src/data/contentValidator.js';
import { listSetDescriptors } from '../src/repositories/lessonRepository.js';

const isG6Tier23 = set => /^g6-u\d{2}-tier23-s\d{2}$/.test(set?.id ?? '');
const isG7Tier23 = set => /^g7-u\d{2}-tier23-s\d{2}$/.test(set?.id ?? '');
const isApprovedTier23 = set => isG6Tier23(set) || isG7Tier23(set);

test('published fixed lessons keep 80% default except approved G6/G7 Tier 2-3 SSOT programs at 90%', () => {
  const descriptors = listSetDescriptors();
  const g6Tier23 = descriptors.filter(isG6Tier23);
  const g7Tier23 = descriptors.filter(isG7Tier23);
  const other = descriptors.filter(set => !isApprovedTier23(set));
  assert.equal(descriptors.length, lessonRegistry.length);
  assert.equal(g6Tier23.length, 137);
  assert.equal(g7Tier23.length, 76);
  assert.ok(g6Tier23.every(set => set.passThreshold === 90));
  assert.ok(g7Tier23.every(set => set.passThreshold === 90));
  assert.ok(other.every(set => set.passThreshold === 80));
  assert.ok(descriptors.every(set => set.lessonSlug));
});

test('catalog may omit passThreshold and repository policy supplies the default instead of requiring developer repetition', () => {
  const folder = { id: 'f', name: 'Folder', order: 1 };
  const entry = {
    id: 'x', folderId: 'f', order: 1, version: 1,
    course: 'Course', unit: 'Unit', title: 'Lesson', subtitle: 'MCQ', lessonSlug: 'lesson-x',
    teacher: 'Teacher', description: 'Description', activityTypes: ['mcq'], itemCount: 1,
    loadContent: async () => ({ items: [] })
  };
  assert.deepEqual(validateCatalog([folder], [entry]), []);
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
});

test('content validator accepts omitted default and valid runtime overrides but rejects invalid thresholds', () => {
  const item = {
    id: 'q1', type: 'mcq', prompt: 'Choose',
    choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'a'
  };
  assert.deepEqual(validateSet({ id: 'default', items: [item] }), []);
  assert.deepEqual(validateSet({ id: 'override', passThreshold: 90, items: [item] }), []);
  assert.ok(validateSet({ id: 'bad', passThreshold: 80.5, items: [item] }).some(error => error.includes('số nguyên')));
});
