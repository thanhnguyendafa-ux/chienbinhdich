import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/lessonCatalog.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor, listFolders, listSetDescriptors, listSetsByFolder, loadLessonSet } from '../src/repositories/lessonRepository.js';

test('catalog exposes hierarchical Global 7 Unit 1 plus sample and MRT folders', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
  assert.deepEqual(listFolders().map(folder => folder.id), ['samples', 'global7', 'global7-unit1', 'mrt-lessons']);
  assert.equal(listFolders().find(folder => folder.id === 'global7-unit1')?.parentId, 'global7');
  assert.deepEqual(listSetsByFolder('samples').map(set => set.id), ['g7-u1-mixed-demo', 'g7-u1-s1']);
  assert.deepEqual(listSetsByFolder('global7-unit1').map(set => set.id), [
    'g7-u1-translation-01',
    'g7-u1-translation-02'
  ]);
  assert.deepEqual(listSetsByFolder('mrt-lessons').map(set => set.id), [
    'mrt-g6-gan-aura-action-01',
    'mrt-left-cut-right-01'
  ]);
});

test('published Set ids are unique and every descriptor resolves through repository', async () => {
  const descriptors = listSetDescriptors();
  assert.equal(new Set(descriptors.map(set => set.id)).size, descriptors.length);
  for (const descriptor of descriptors) {
    assert.deepEqual(getSetDescriptor(descriptor.id), descriptor);
    assert.equal('loadContent' in descriptor, false);
    const set = await loadLessonSet(descriptor.id);
    assert.equal(set.id, descriptor.id);
    assert.equal(set.folderId, descriptor.folderId);
    assert.equal(set.items.length, descriptor.itemCount);
    assert.deepEqual(validateSet(set), []);
  }
});

test('catalog validator rejects duplicate ids, dangling references and folder cycles', () => {
  const folder = { id: 'sample', name: 'Sample', order: 1 };
  const entry = {
    id: 'one', folderId: 'missing', title: 'One', course: 'Course', unit: 'Unit', itemCount: 1,
    passThreshold: 80, activityTypes: ['mcq'], assignmentSlug: 'one', order: 1, loadContent: async () => ({ items: [] })
  };
  const errors = validateCatalog([folder, folder], [entry, entry]);
  assert.ok(errors.some(error => error.includes('Folder id bị trùng')));
  assert.ok(errors.some(error => error.includes('Set id bị trùng')));
  assert.ok(errors.some(error => error.includes('folder không tồn tại')));

  const cyclic = validateCatalog([
    { id: 'a', name: 'A', order: 1, parentId: 'b' },
    { id: 'b', name: 'B', order: 1, parentId: 'a' }
  ], []);
  assert.ok(cyclic.some(error => error.includes('Folder tree có vòng lặp')));
});
