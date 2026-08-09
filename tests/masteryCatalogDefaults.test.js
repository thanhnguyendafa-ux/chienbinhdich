import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonFolders, lessonRegistry } from '../src/data/lessonCatalog.js';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { validateSet } from '../src/data/contentValidator.js';
import { listSetDescriptors } from '../src/repositories/lessonRepository.js';

test('all 11 currently published fixed lessons still default to 80% Mastery', () => {
  const descriptors = listSetDescriptors();
  assert.equal(descriptors.length, 11);
  assert.equal(descriptors.filter(set => set.passThreshold !== 80).length, 0);
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
