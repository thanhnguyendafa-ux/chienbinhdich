import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/lessonCatalog.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor, getSetDescriptorBySlug, listFolders, listSetDescriptors, listSetsByFolder, loadLessonSet } from '../src/repositories/lessonRepository.js';

test('catalog exposes hierarchical Global 5, Global 7 and MRT folders with their published Sets', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
  assert.deepEqual(listFolders().map(folder => folder.id), [
    'samples',
    'global5',
    'global5-unit1',
    'global7',
    'global7-unit1',
    'mrt-lessons'
  ]);
  assert.deepEqual(listSetsByFolder('samples').map(set => set.id), ['g7-u1-mixed-demo', 'g7-u1-s1']);
  assert.deepEqual(listSetsByFolder('global5-unit1').map(set => set.id), ['g5-u1-vocab-01', 'g5-u1-pattern-01']);
  assert.deepEqual(listSetsByFolder('global7-unit1').map(set => set.id), [
    'g7-u1-translation-01',
    'g7-u1-translation-02'
  ]);
  assert.deepEqual(listSetsByFolder('mrt-lessons').map(set => set.id), [
    'mrt-g6-gan-aura-action-01',
    'mrt-left-cut-right-01'
  ]);
});

test('published Set ids and fixed lesson slugs are unique and repository-resolvable', async () => {
  const descriptors = listSetDescriptors();
  assert.equal(new Set(descriptors.map(set => set.id)).size, descriptors.length);
  assert.equal(new Set(descriptors.map(set => set.lessonSlug)).size, descriptors.length);
  for (const descriptor of descriptors) {
    assert.deepEqual(getSetDescriptor(descriptor.id), descriptor);
    assert.deepEqual(getSetDescriptorBySlug(descriptor.lessonSlug), descriptor);
    assert.equal('loadContent' in descriptor, false);
    const set = await loadLessonSet(descriptor.id);
    assert.equal(set.id, descriptor.id);
    assert.equal(set.folderId, descriptor.folderId);
    assert.equal(set.items.length, descriptor.itemCount);
    assert.deepEqual(validateSet(set), []);
  }
});

test('catalog validator rejects duplicate ids, dangling folders and duplicate fixed slugs', () => {
  const folder = { id: 'sample', name: 'Sample', order: 1 };
  const entry = {
    id: 'one', folderId: 'missing', title: 'One', course: 'Course', unit: 'Unit', itemCount: 1,
    passThreshold: 80, activityTypes: ['mcq'], lessonSlug: 'one-mcq', order: 1, loadContent: async () => ({ items: [] })
  };
  const errors = validateCatalog([folder, folder], [entry, entry]);
  assert.ok(errors.some(error => error.includes('Folder id bị trùng')));
  assert.ok(errors.some(error => error.includes('Set id bị trùng')));
  assert.ok(errors.some(error => error.includes('folder không tồn tại')));
  assert.ok(errors.some(error => error.includes('lessonSlug bị trùng')));
});
