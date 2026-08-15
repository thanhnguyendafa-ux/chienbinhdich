import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { validateSet } from '../src/data/contentValidator.js';
import { getSetDescriptor, getSetDescriptorBySlug, listFolders, listSetDescriptors, listSetsByFolder, loadLessonSet } from '../src/repositories/lessonRepository.js';

test('catalog exposes hierarchical Global 2, 3, 5, 6, 7 and MRT folders with their published Sets', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
  const folderIds = listFolders().map(folder => folder.id);
  for (const id of [
    'samples', 'global2', 'global2-unit6', 'global2-unit6-translation',
    'global2-writing-typing', 'global2-writing-u01', 'global2-writing-u16',
    'global3', 'global3-writing-typing', 'global3-writing-u01', 'global3-writing-u20',
    'global5', 'global5-unit1', 'global5-unit2', 'global5-review-u1-5', 'global5-review',
    'global6', 'global6-unit1', 'global6-unit1-mlh-reading', 'global6-unit1-mlh-writing', 'global6-unit1-writing-typing', 'global6-unit1-writing-final', 'global6-review-u1-3-mixed',
    'global7', 'global7-unit1', 'global7-unit1-writing-typing', 'global7-unit1-writing-final', 'global7-review-u1-3-mixed',
    'mrt-lessons'
  ]) assert.ok(folderIds.includes(id), id);

  assert.deepEqual(listSetsByFolder('samples').map(set => set.id), ['g7-u1-mixed-demo', 'g7-u1-s1']);
  assert.deepEqual(listSetsByFolder('global2-unit6-translation').map(set => set.id), [
    'g2-u6-translation-01', 'g2-u6-translation-02', 'g2-u6-translation-03',
    'g2-u6-translation-04', 'g2-u6-translation-05', 'g2-u6-translation-06',
    'g2-u6-translation-07', 'g2-u6-translation-08', 'g2-u6-translation-09'
  ]);
  assert.equal(listSetsByFolder('global2-writing-typing').length, 0);
  assert.equal(listSetsByFolder('global2-writing-u01').length, 3);
  assert.equal(listSetsByFolder('global2-writing-u16').length, 4);
  assert.equal(listSetsByFolder('global3-writing-typing').length, 0);
  assert.equal(listSetsByFolder('global3-writing-u01').length, 5);
  assert.equal(listSetsByFolder('global3-writing-u20').length, 5);

  assert.deepEqual(listSetsByFolder('global5-unit1').map(set => set.id), [
    'g5-u1-vocab-01', 'g5-u1-pattern-01', 'g5-u1-reading-01', 'g5-u1-writing-01'
  ]);
  assert.deepEqual(listSetsByFolder('global5-unit2').map(set => set.id), ['g5-u2-stress-vocab-01']);
  assert.equal(listSetsByFolder('global5-review-u1-5').length, 10);
  assert.deepEqual(listSetsByFolder('global5-review').map(set => set.id), ['g5-review-main-idea-01']);

  assert.deepEqual(listSetsByFolder('global6-unit1').map(set => set.id), ['g7-u1-mlh-vocab-context-01']);
  assert.deepEqual(listSetsByFolder('global6-unit1-mlh-reading').map(set => set.id), [
    'g6-u1-mlh-reading-gap-01', 'g6-u1-mlh-reading-tf-evidence-01'
  ]);
  assert.deepEqual(listSetsByFolder('global6-unit1-mlh-writing').map(set => set.id), [
    'g6-u1-mlh-writing-reorder-01', 'g6-u1-mlh-writing-rewrite-01'
  ]);
  assert.equal(listSetsByFolder('global6-unit1-writing-s1').length, 4);
  assert.equal(listSetsByFolder('global6-unit1-writing-s6').length, 5);
  assert.equal(listSetsByFolder('global6-unit1-writing-final').length, 3);
  assert.equal(listSetsByFolder('global6-unit1-writing-typing').length, 0);
  assert.equal(listSetsByFolder('global6-review-u1-3-present-simple').length, 3);
  assert.equal(listSetsByFolder('global6-review-u1-3-present-continuous').length, 3);
  assert.equal(listSetsByFolder('global6-review-u1-3-mixed').length, 8);

  assert.deepEqual(listSetsByFolder('global7-unit1').map(set => set.id), [
    'g7-u1-translation-01', 'g7-u1-translation-02', 'g7-u1-pronunciation-01'
  ]);
  assert.equal(listSetsByFolder('global7-unit1-writing-s1').length, 4);
  assert.equal(listSetsByFolder('global7-unit1-writing-s4').length, 5);
  assert.equal(listSetsByFolder('global7-unit1-writing-s10').length, 5);
  assert.equal(listSetsByFolder('global7-unit1-writing-final').length, 3);
  assert.equal(listSetsByFolder('global7-unit1-writing-typing').length, 0);
  assert.equal(listSetsByFolder('global7-review-u1-3-present-simple').length, 4);
  assert.equal(listSetsByFolder('global7-review-u1-3-mixed').length, 8);
  assert.deepEqual(listSetsByFolder('mrt-lessons').map(set => set.id), ['mrt-g6-gan-aura-action-01', 'mrt-left-cut-right-01']);
});

test('published Set ids, canonical slugs and legacy aliases are unique and repository-resolvable', async () => {
  const descriptors = listSetDescriptors();
  assert.equal(new Set(descriptors.map(set => set.id)).size, descriptors.length);
  assert.equal(new Set(descriptors.map(set => set.lessonSlug)).size, descriptors.length);
  for (const descriptor of descriptors) {
    assert.deepEqual(getSetDescriptor(descriptor.id), descriptor);
    assert.deepEqual(getSetDescriptorBySlug(descriptor.lessonSlug), descriptor);
    for (const alias of descriptor.lessonSlugAliases ?? []) assert.deepEqual(getSetDescriptorBySlug(alias), descriptor);
    assert.equal('loadContent' in descriptor, false);
    const set = await loadLessonSet(descriptor.id);
    assert.equal(set.id, descriptor.id);
    assert.equal(set.folderId, descriptor.folderId);
    assert.equal(set.items.length, descriptor.itemCount);
    assert.deepEqual(validateSet(set), []);
  }

  const corrected = getSetDescriptorBySlug('g6u1-mlh-vocab-context');
  const legacy = getSetDescriptorBySlug('g7u1-mlh-vocab-context');
  assert.ok(corrected);
  assert.equal(corrected.id, 'g7-u1-mlh-vocab-context-01');
  assert.equal(corrected.course, 'Global Success 6');
  assert.equal(corrected.unit, 'Unit 1 · My New School');
  assert.equal(corrected.folderId, 'global6-unit1');
  assert.equal(legacy?.id, corrected.id);
  assert.equal(legacy?.lessonSlug, 'g6u1-mlh-vocab-context');

  const readingGap = getSetDescriptorBySlug('g6u1-mlh-reading-gap-01');
  assert.ok(readingGap);
  assert.equal(readingGap.id, 'g6-u1-mlh-reading-gap-01');
  assert.equal(readingGap.folderId, 'global6-unit1-mlh-reading');
  assert.equal(readingGap.itemCount, 36);

  const tfEvidence = getSetDescriptorBySlug('g6u1-mlh-reading-tf-evidence-01');
  assert.ok(tfEvidence);
  assert.equal(tfEvidence.id, 'g6-u1-mlh-reading-tf-evidence-01');
  assert.equal(tfEvidence.folderId, 'global6-unit1-mlh-reading');
  assert.equal(tfEvidence.itemCount, 31);
  assert.equal(tfEvidence.course, 'Global Success 6');
  assert.equal(tfEvidence.unit, 'Unit 1 · My New School');

  const writingReorder = getSetDescriptorBySlug('g6u1-mlh-writing-reorder-01');
  assert.ok(writingReorder);
  assert.equal(writingReorder.id, 'g6-u1-mlh-writing-reorder-01');
  assert.equal(writingReorder.folderId, 'global6-unit1-mlh-writing');
  assert.equal(writingReorder.itemCount, 64);
  assert.equal(writingReorder.course, 'Global Success 6');
  assert.equal(writingReorder.unit, 'Unit 1 · My New School');

  const writingRewrite = getSetDescriptorBySlug('g6u1-mlh-writing-rewrite-01');
  assert.ok(writingRewrite);
  assert.equal(writingRewrite.id, 'g6-u1-mlh-writing-rewrite-01');
  assert.equal(writingRewrite.folderId, 'global6-unit1-mlh-writing');
  assert.equal(writingRewrite.itemCount, 51);
  assert.equal(writingRewrite.course, 'Global Success 6');
  assert.equal(writingRewrite.unit, 'Unit 1 · My New School');
  assert.deepEqual(writingRewrite.activityTypes, ['typing', 'mcq']);
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

test('catalog validator rejects invalid or colliding legacy lesson slug aliases', () => {
  const folder = { id: 'sample', name: 'Sample', order: 1 };
  const base = {
    folderId: 'sample', title: 'One', course: 'Course', unit: 'Unit', itemCount: 1,
    activityTypes: ['mcq'], order: 1, loadContent: async () => ({ items: [] })
  };
  const errors = validateCatalog([folder], [
    { ...base, id: 'one', lessonSlug: 'one-mcq', lessonSlugAliases: ['legacy-one'] },
    { ...base, id: 'two', lessonSlug: 'two-mcq', lessonSlugAliases: ['legacy-one', 'bad-P9M3X8'] }
  ]);
  assert.ok(errors.some(error => error.includes('lessonSlug bị trùng: legacy-one')));
  assert.ok(errors.some(error => error.includes('lessonSlug alias không hợp lệ')));
});
