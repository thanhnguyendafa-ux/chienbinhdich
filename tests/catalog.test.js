import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/lessonCatalog.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor, listFolders, listSetDescriptors, listSetsByFolder, loadLessonSet } from '../src/repositories/lessonRepository.js';

test('catalog has one valid sample folder with both published Sets', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
  assert.deepEqual(listFolders().map(folder => folder.id), ['samples']);
  assert.deepEqual(listSetsByFolder('samples').map(set => set.id), ['g7-u1-mixed-demo', 'g7-u1-s1']);
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

test('catalog validator rejects duplicate ids and dangling folder references', () => {
  const folder = { id: 'sample', name: 'Sample' };
  const entry = {
    id: 'one', folderId: 'missing', title: 'One', course: 'Course', unit: 'Unit', itemCount: 1,
    passThreshold: 80, activityTypes: ['mcq'], loadContent: async () => ({ items: [] })
  };
  const errors = validateCatalog([folder, folder], [entry, entry]);
  assert.ok(errors.some(error => error.includes('Folder id bị trùng')));
  assert.ok(errors.some(error => error.includes('Set id bị trùng')));
  assert.ok(errors.some(error => error.includes('folder không tồn tại')));
});
