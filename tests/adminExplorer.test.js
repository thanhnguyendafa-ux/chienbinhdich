import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonFolders } from '../src/data/publishedLessonCatalog.js';
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

test('Explorer tree nests Global Success 2, 5, 6 and 7 without changing Set ids', () => {
  assert.equal(tree.id, rootFolderId());
  assert.deepEqual(tree.children.filter(node => node.type === 'folder').map(node => node.id), ['samples', 'global2', 'global5', 'global6', 'global7', 'mrt-lessons']);

  assert.deepEqual(findAdminTreeNode(tree, 'global2').children.filter(node => node.type === 'folder').map(node => node.id), ['global2-unit6']);
  assert.deepEqual(findAdminTreeNode(tree, 'global2-unit6').children.filter(node => node.type === 'folder').map(node => node.id), ['global2-unit6-translation']);
  assert.deepEqual(folderEntries(tree, 'global2-unit6-translation').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g2-u6-translation-01', 'g2-u6-translation-02', 'g2-u6-translation-03',
    'g2-u6-translation-04', 'g2-u6-translation-05', 'g2-u6-translation-06',
    'g2-u6-translation-07', 'g2-u6-translation-08', 'g2-u6-translation-09'
  ]);

  assert.deepEqual(findAdminTreeNode(tree, 'global5').children.filter(node => node.type === 'folder').map(node => node.id), [
    'global5-unit1', 'global5-unit2', 'global5-review-u1-5', 'global5-review'
  ]);
  assert.deepEqual(folderEntries(tree, 'global5-unit1').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g5-u1-vocab-01', 'g5-u1-pattern-01', 'g5-u1-reading-01', 'g5-u1-writing-01'
  ]);
  assert.equal(folderEntries(tree, 'global5-review-u1-5').filter(node => node.type === 'lesson').length, 10);

  const global6 = findAdminTreeNode(tree, 'global6');
  assert.deepEqual(global6.children.filter(node => node.type === 'folder').map(node => node.id), ['global6-unit1-writing-typing', 'global6-unit-review']);
  const g6 = findAdminTreeNode(tree, 'global6-unit1-writing-typing');
  assert.equal(g6.children.filter(node => node.type === 'folder').length, 10);
  assert.equal(folderEntries(tree, 'global6-unit1-writing-s1').filter(node => node.type === 'lesson').length, 4);
  assert.equal(folderEntries(tree, 'global6-unit1-writing-s6').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global6-unit1-writing-final').filter(node => node.type === 'lesson').length, 3);

  assert.deepEqual(findAdminTreeNode(tree, 'global6-unit-review').children.filter(node => node.type === 'folder').map(node => node.id), ['global6-review-u1-3']);
  assert.deepEqual(findAdminTreeNode(tree, 'global6-review-u1-3').children.filter(node => node.type === 'folder').map(node => node.id), ['global6-review-u1-3-grammar']);
  assert.deepEqual(findAdminTreeNode(tree, 'global6-review-u1-3-grammar').children.filter(node => node.type === 'folder').map(node => node.id), [
    'global6-review-u1-3-present-simple', 'global6-review-u1-3-frequency', 'global6-review-u1-3-possessive',
    'global6-review-u1-3-prepositions', 'global6-review-u1-3-there-be', 'global6-review-u1-3-description',
    'global6-review-u1-3-present-continuous', 'global6-review-u1-3-simple-vs-continuous',
    'global6-review-u1-3-integrated', 'global6-review-u1-3-mixed'
  ]);
  assert.equal(folderEntries(tree, 'global6-review-u1-3-present-simple').filter(node => node.type === 'lesson').length, 3);
  assert.equal(folderEntries(tree, 'global6-review-u1-3-present-continuous').filter(node => node.type === 'lesson').length, 3);
  assert.equal(folderEntries(tree, 'global6-review-u1-3-mixed').filter(node => node.type === 'lesson').length, 8);

  const global7 = findAdminTreeNode(tree, 'global7');
  assert.deepEqual(global7.children.filter(node => node.type === 'folder').map(node => node.id), ['global7-unit1']);
  const g7Unit1 = findAdminTreeNode(tree, 'global7-unit1');
  assert.deepEqual(g7Unit1.children.filter(node => node.type === 'folder').map(node => node.id), ['global7-unit1-writing-typing']);
  assert.deepEqual(folderEntries(tree, 'global7-unit1').filter(node => node.type === 'lesson').map(node => node.setId), ['g7-u1-translation-01', 'g7-u1-translation-02']);
  const g7Writing = findAdminTreeNode(tree, 'global7-unit1-writing-typing');
  assert.equal(g7Writing.children.filter(node => node.type === 'folder').length, 11);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-s1').filter(node => node.type === 'lesson').length, 4);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-s4').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-s10').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-final').filter(node => node.type === 'lesson').length, 3);
});

test('Explorer breadcrumbs and recursive lesson counts match the hierarchy', () => {
  assert.deepEqual(folderBreadcrumbs(tree, 'global2-unit6-translation').map(item => item.label), ['Bài tập', 'Global Success 2', 'Unit 6', 'Bài tập dịch câu']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-unit1').map(item => item.label), ['Bài tập', 'Global Success 5', 'Unit 1 · All about me!']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-unit2').map(item => item.label), ['Bài tập', 'Global Success 5', 'Unit 2 · Our homes']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-review-u1-5').map(item => item.label), ['Bài tập', 'Global Success 5', 'Review Unit 1–5']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-review').map(item => item.label), ['Bài tập', 'Global Success 5', 'Global Success 5 Review']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global6-unit1-writing-s1').map(item => item.label), ['Bài tập', 'Global Success 6', 'G6Unit1 Writing Typing', 'Cấu trúc 1 · School Identity']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global6-review-u1-3-mixed').map(item => item.label), [
    'Bài tập', 'Global Success 6', 'Unit Review', 'G6 Unit 1-2-3 Review', 'Grammar Review', '10 · Mixed Grammar Review'
  ]);
  assert.deepEqual(folderBreadcrumbs(tree, 'global7-unit1-writing-s1').map(item => item.label), ['Bài tập', 'Global Success 7', 'Unit 1 · Hobbies', 'G7Unit1 Writing Typing', 'Cấu trúc 1 · Hobby Identification']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global7-unit1-writing-final').map(item => item.label), ['Bài tập', 'Global Success 7', 'Unit 1 · Hobbies', 'G7Unit1 Writing Typing', 'Final Writing Integration']);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global2')), 9);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global5')), 16);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global6')), 65);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global6-unit-review')), 23);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global7')), 46);
  assert.equal(folderLessonCount(tree), sets.length);
});

test('Explorer search finds lessons by title, slug, Set id, Unit and activity type', () => {
  assert.ok(searchLessonDescriptors(sets, 'aura').some(set => set.id === 'g6-u1-writing-s4-04'));
  assert.ok(searchLessonDescriptors(sets, 'aura').some(set => set.id === 'mrt-g6-gan-aura-action-01'));
  assert.deepEqual(searchLessonDescriptors(sets, 'g2u6-dich-cau-9').map(set => set.id), ['g2-u6-translation-09']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5u1-tu-vung-1').map(set => set.id), ['g5-u1-vocab-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5-review-main-idea-1').map(set => set.id), ['g5-review-main-idea-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5-review-u1-5-mixed-10').map(set => set.id), ['g5-review-u1-5-10']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g7u1-dich2-mcq').map(set => set.id), ['g7-u1-translation-02']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-writing-s1-01').map(set => set.id), ['g6-u1-writing-s1-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g7u1-writing-s1-01').map(set => set.id), ['g7-u1-writing-s1-01']);
  assert.ok(searchLessonDescriptors(sets, 'Final U1–5 Challenge').some(set => set.id === 'g5-review-u1-5-10'));
  assert.ok(searchLessonDescriptors(sets, 'Final U1–3 Challenge').some(set => set.id === 'g6-review-u1-3-mix-08'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g7-u1-s1'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g6-u1-writing-s1-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g7-u1-writing-s1-01'));
  assert.ok(searchLessonDescriptors(sets, 'Hobbies').some(set => set.id === 'g7-u1-translation-01'));
});

test('Explorer type filters distinguish single-type lessons from mixed lessons', () => {
  const g2Typing = sets.find(set => set.id === 'g2-u6-translation-01');
  const g6Typing = sets.find(set => set.id === 'g6-u1-writing-s1-01');
  const g7Typing = sets.find(set => set.id === 'g7-u1-writing-s1-01');
  const mcq = sets.find(set => set.id === 'g7-u1-translation-01');
  const mixed = sets.find(set => set.id === 'mrt-left-cut-right-01');
  const global5Mixed = sets.find(set => set.id === 'g5-u1-vocab-01');
  const reviewMixed = sets.find(set => set.id === 'g5-review-u1-5-01');
  const g6ReviewMixed = sets.find(set => set.id === 'g6-review-u1-3-mix-01');
  const writing = sets.find(set => set.id === 'g5-u1-writing-01');
  const classificationOnly = { activityTypes: ['classification'] };
  assert.equal(lessonMatchesType(g2Typing, 'typing'), true);
  assert.equal(lessonMatchesType(g6Typing, 'typing'), true);
  assert.equal(lessonMatchesType(g7Typing, 'typing'), true);
  assert.equal(lessonMatchesType(mcq, 'mcq'), true);
  assert.equal(lessonMatchesType(mixed, 'mix'), true);
  assert.equal(lessonMatchesType(mixed, 'mcq'), false);
  assert.equal(lessonMatchesType(global5Mixed, 'mix'), true);
  assert.equal(lessonMatchesType(reviewMixed, 'mix'), true);
  assert.equal(lessonMatchesType(g6ReviewMixed, 'mix'), true);
  assert.equal(lessonMatchesType(reviewMixed, 'order'), false);
  assert.equal(lessonMatchesType(reviewMixed, 'classify'), false);
  assert.equal(lessonMatchesType(writing, 'order'), true);
  assert.equal(lessonMatchesType(classificationOnly, 'classify'), true);
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
