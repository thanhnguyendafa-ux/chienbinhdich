import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor, getSetDescriptorBySlug, listFolders, listSetDescriptors, listSetsByFolder, loadLessonSet } from '../src/repositories/lessonRepository.js';

test('catalog exposes hierarchical Global 2, 5, 6, 7 and MRT folders with their published Sets', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
  assert.deepEqual(listFolders().map(folder => folder.id), [
    'samples',
    'global2', 'global2-unit6', 'global2-unit6-translation',
    'global5', 'global5-unit1', 'global5-unit2', 'global5-review-u1-5', 'global5-review',
    'global6', 'global6-unit1-writing-typing',
    'global6-unit1-writing-s1', 'global6-unit1-writing-s2', 'global6-unit1-writing-s3',
    'global6-unit1-writing-s4', 'global6-unit1-writing-s5', 'global6-unit1-writing-s6',
    'global6-unit1-writing-s7', 'global6-unit1-writing-s8', 'global6-unit1-writing-s9',
    'global6-unit1-writing-final',
    'global7', 'global7-unit1', 'global7-unit1-writing-typing',
    'global7-unit1-writing-s1', 'global7-unit1-writing-s2', 'global7-unit1-writing-s3',
    'global7-unit1-writing-s4', 'global7-unit1-writing-s5', 'global7-unit1-writing-s6',
    'global7-unit1-writing-s7', 'global7-unit1-writing-s8', 'global7-unit1-writing-s9',
    'global7-unit1-writing-s10', 'global7-unit1-writing-final',
    'mrt-lessons'
  ]);
  assert.deepEqual(listSetsByFolder('samples').map(set => set.id), ['g7-u1-mixed-demo', 'g7-u1-s1']);
  assert.deepEqual(listSetsByFolder('global2-unit6-translation').map(set => set.id), [
    'g2-u6-translation-01', 'g2-u6-translation-02', 'g2-u6-translation-03',
    'g2-u6-translation-04', 'g2-u6-translation-05', 'g2-u6-translation-06',
    'g2-u6-translation-07', 'g2-u6-translation-08', 'g2-u6-translation-09'
  ]);
  assert.deepEqual(listSetsByFolder('global5-unit1').map(set => set.id), [
    'g5-u1-vocab-01', 'g5-u1-pattern-01', 'g5-u1-reading-01', 'g5-u1-writing-01'
  ]);
  assert.deepEqual(listSetsByFolder('global5-unit2').map(set => set.id), ['g5-u2-stress-vocab-01']);
  assert.deepEqual(listSetsByFolder('global5-review-u1-5').map(set => set.id), [
    'g5-review-u1-5-01', 'g5-review-u1-5-02', 'g5-review-u1-5-03', 'g5-review-u1-5-04', 'g5-review-u1-5-05',
    'g5-review-u1-5-06', 'g5-review-u1-5-07', 'g5-review-u1-5-08', 'g5-review-u1-5-09', 'g5-review-u1-5-10'
  ]);
  assert.deepEqual(listSetsByFolder('global5-review').map(set => set.id), ['g5-review-main-idea-01']);
  assert.equal(listSetsByFolder('global6-unit1-writing-s1').length, 4);
  assert.equal(listSetsByFolder('global6-unit1-writing-s6').length, 5);
  assert.equal(listSetsByFolder('global6-unit1-writing-final').length, 3);
  assert.equal(listSetsByFolder('global6-unit1-writing-typing').length, 0);
  assert.deepEqual(listSetsByFolder('global7-unit1').map(set => set.id), ['g7-u1-translation-01', 'g7-u1-translation-02']);
  assert.equal(listSetsByFolder('global7-unit1-writing-s1').length, 4);
  assert.equal(listSetsByFolder('global7-unit1-writing-s4').length, 5);
  assert.equal(listSetsByFolder('global7-unit1-writing-s10').length, 5);
  assert.equal(listSetsByFolder('global7-unit1-writing-final').length, 3);
  assert.equal(listSetsByFolder('global7-unit1-writing-typing').length, 0);
  assert.deepEqual(listSetsByFolder('mrt-lessons').map(set => set.id), ['mrt-g6-gan-aura-action-01', 'mrt-left-cut-right-01']);
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

test('catalog validator rejects duplicate ids, dangling folders, duplicate fixed slugs and invalid metadata', () => {
  const folder = { id: 'sample', name: 'Sample', order: 1 };
  const entry = {
    id: 'one', folderId: 'missing', title: 'One', course: 'Course', unit: 'Unit', itemCount: 1,
    passThreshold: 80, typingTolerance: 'yes', difficulty: 'super-hard', expectedTimeMinutes: 21,
    activityTypes: ['mcq'], lessonSlug: 'one-mcq', order: 1,
    loadContent: async () => ({ items: [] })
  };
  const errors = validateCatalog([folder, folder], [entry, entry]);
  assert.ok(errors.some(error => error.includes('Folder id bị trùng')));
  assert.ok(errors.some(error => error.includes('Set id bị trùng')));
  assert.ok(errors.some(error => error.includes('folder không tồn tại')));
  assert.ok(errors.some(error => error.includes('lessonSlug bị trùng')));
  assert.ok(errors.some(error => error.includes('typingTolerance không hợp lệ')));
  assert.ok(errors.some(error => error.includes('difficulty không hợp lệ')));
  assert.ok(errors.some(error => error.includes('expectedTimeMinutes không hợp lệ')));
});
