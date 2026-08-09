import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonFolders } from '../src/data/lessonCatalog.js';
import { listSetDescriptors } from '../src/repositories/lessonRepository.js';
import {
  buildAdminLessonTree,
  findAdminTreeNode,
  folderBreadcrumbs,
  folderEntries,
  folderLessonCount,
  lessonMatchesType,
  rootFolderId,
  searchLessonDescriptors
} from '../src/features/admin/adminTreeModel.js';

const sets = listSetDescriptors();
const tree = buildAdminLessonTree(lessonFolders, sets);

test('Explorer tree nests Global Success 5 and Global Success 7 Units without changing Set ids', () => {
  assert.equal(tree.id, rootFolderId());
  assert.deepEqual(tree.children.filter(node => node.type === 'folder').map(node => node.id), [
    'samples',
    'global5',
    'global7',
    'mrt-lessons'
  ]);

  const global5 = findAdminTreeNode(tree, 'global5');
  assert.deepEqual(global5.children.filter(node => node.type === 'folder').map(node => node.id), ['global5-unit1']);
  assert.deepEqual(folderEntries(tree, 'global5-unit1').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g5-u1-vocab-01',
    'g5-u1-pattern-01'
  ]);

  const global7 = findAdminTreeNode(tree, 'global7');
  assert.deepEqual(global7.children.filter(node => node.type === 'folder').map(node => node.id), ['global7-unit1']);
  assert.deepEqual(folderEntries(tree, 'global7-unit1').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g7-u1-translation-01',
    'g7-u1-translation-02'
  ]);
});

test('Explorer breadcrumbs and recursive lesson counts match the hierarchy', () => {
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-unit1').map(item => item.label), [
    'Bài tập',
    'Global Success 5',
    'Unit 1 · All about me!'
  ]);
  assert.deepEqual(folderBreadcrumbs(tree, 'global7-unit1').map(item => item.label), [
    'Bài tập',
    'Global Success 7',
    'Unit 1 · Hobbies'
  ]);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global5')), 2);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global7')), 2);
  assert.equal(folderLessonCount(tree), sets.length);
});

test('Explorer search finds lessons by title, slug, Set id, Unit and activity type', () => {
  assert.deepEqual(searchLessonDescriptors(sets, 'aura').map(set => set.id), ['mrt-g6-gan-aura-action-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5u1-tu-vung-1').map(set => set.id), ['g5-u1-vocab-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5u1-mau-cau-1').map(set => set.id), ['g5-u1-pattern-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g7u1-dich2-mcq').map(set => set.id), ['g7-u1-translation-02']);
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g7-u1-s1'));
  assert.ok(searchLessonDescriptors(sets, 'All about me').some(set => set.id === 'g5-u1-vocab-01'));
  assert.ok(searchLessonDescriptors(sets, 'All about me').some(set => set.id === 'g5-u1-pattern-01'));
  assert.ok(searchLessonDescriptors(sets, 'Hobbies').some(set => set.id === 'g7-u1-translation-01'));
});

test('Explorer type filters distinguish single-type lessons from mixed lessons', () => {
  const mcq = sets.find(set => set.id === 'g7-u1-translation-01');
  const typing = sets.find(set => set.id === 'g7-u1-s1');
  const mixed = sets.find(set => set.id === 'mrt-left-cut-right-01');
  const global5Mixed = sets.find(set => set.id === 'g5-u1-vocab-01');
  assert.equal(lessonMatchesType(mcq, 'mcq'), true);
  assert.equal(lessonMatchesType(typing, 'typing'), true);
  assert.equal(lessonMatchesType(mixed, 'mix'), true);
  assert.equal(lessonMatchesType(mixed, 'mcq'), false);
  assert.equal(lessonMatchesType(global5Mixed, 'mix'), true);
});

test('every published Set appears exactly once in the Explorer tree', () => {
  const found = [];
  const visit = node => {
    for (const child of node.children ?? []) {
      if (child.type === 'lesson') found.push(child.setId);
      else visit(child);
    }
  };
  visit(tree);
  assert.deepEqual([...found].sort(), sets.map(set => set.id).sort());
  assert.equal(new Set(found).size, found.length);
});
