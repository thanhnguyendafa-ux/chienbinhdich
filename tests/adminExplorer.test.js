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

test('Explorer tree nests Global Success 2, 3, 5, 6 and 7 without changing Set ids', () => {
  assert.equal(tree.id, rootFolderId());
  assert.deepEqual(tree.children.filter(node => node.type === 'folder').map(node => node.id), [
    'samples', 'global2', 'global3', 'global5', 'global6', 'global7', 'mrt-lessons'
  ]);

  assert.deepEqual(findAdminTreeNode(tree, 'global2').children.filter(node => node.type === 'folder').map(node => node.id), [
    'global2-unit6', 'global2-writing-typing'
  ]);
  assert.deepEqual(findAdminTreeNode(tree, 'global2-unit6').children.filter(node => node.type === 'folder').map(node => node.id), ['global2-unit6-translation']);
  assert.deepEqual(folderEntries(tree, 'global2-unit6-translation').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g2-u6-translation-01', 'g2-u6-translation-02', 'g2-u6-translation-03',
    'g2-u6-translation-04', 'g2-u6-translation-05', 'g2-u6-translation-06',
    'g2-u6-translation-07', 'g2-u6-translation-08', 'g2-u6-translation-09'
  ]);
  const g2Writing = findAdminTreeNode(tree, 'global2-writing-typing');
  assert.equal(g2Writing.children.filter(node => node.type === 'folder').length, 16);
  assert.equal(folderEntries(tree, 'global2-writing-u01').filter(node => node.type === 'lesson').length, 3);
  assert.equal(folderEntries(tree, 'global2-writing-u16').filter(node => node.type === 'lesson').length, 4);

  const global3 = findAdminTreeNode(tree, 'global3');
  assert.deepEqual(global3.children.filter(node => node.type === 'folder').map(node => node.id), ['global3-writing-typing']);
  const g3Writing = findAdminTreeNode(tree, 'global3-writing-typing');
  assert.equal(g3Writing.children.filter(node => node.type === 'folder').length, 20);
  assert.equal(folderEntries(tree, 'global3-writing-u01').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global3-writing-u20').filter(node => node.type === 'lesson').length, 5);

  assert.deepEqual(findAdminTreeNode(tree, 'global5').children.filter(node => node.type === 'folder').map(node => node.id), [
    'global5-unit1', 'global5-unit2', 'global5-unit3', 'global5-review-u1-5', 'global5-review'
  ]);
  assert.deepEqual(folderEntries(tree, 'global5-unit1').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g5-u1-vocab-01', 'g5-u1-pattern-01', 'g5-u1-reading-01', 'g5-u1-writing-01'
  ]);
  assert.equal(folderEntries(tree, 'global5-review-u1-5').filter(node => node.type === 'lesson').length, 10);
  assert.equal(folderEntries(tree, 'global5-unit2-writing-typing').filter(node => node.type === 'folder').length, 5);
  assert.equal(folderEntries(tree, 'global5-unit2-writing-address').filter(node => node.type === 'lesson').length, 4);
  assert.equal(folderEntries(tree, 'global5-unit3-writing-typing').filter(node => node.type === 'folder').length, 6);
  assert.equal(folderEntries(tree, 'global5-unit3-writing-qb').filter(node => node.type === 'lesson').length, 1);
  assert.equal(folderEntries(tree, 'global5-unit3-writing-personality').filter(node => node.type === 'lesson').length, 6);

  const global6 = findAdminTreeNode(tree, 'global6');
  assert.deepEqual(global6.children.filter(node => node.type === 'folder').map(node => node.id), ['global6-unit1', 'global6-unit2', 'global6-unit-review']);
  assert.deepEqual(findAdminTreeNode(tree, 'global6-unit1').children.filter(node => node.type === 'folder').map(node => node.id), [
    'global6-unit1-writing-typing', 'global6-unit1-mlh-reading', 'global6-unit1-mlh-writing'
  ]);
  assert.deepEqual(folderEntries(tree, 'global6-unit1').filter(node => node.type === 'lesson').map(node => node.setId), ['g7-u1-mlh-vocab-context-01']);
  assert.deepEqual(folderEntries(tree, 'global6-unit1-mlh-reading').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g6-u1-mlh-reading-gap-01', 'g6-u1-mlh-reading-tf-evidence-01'
  ]);
  assert.deepEqual(folderEntries(tree, 'global6-unit1-mlh-writing').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g6-u1-mlh-writing-reorder-01', 'g6-u1-mlh-writing-rewrite-01', 'g6-u1-mlh-writing-question-words-01', 'g6-u1-mlh-writing-dialogue-order-01'
  ]);
  const g6 = findAdminTreeNode(tree, 'global6-unit1-writing-typing');
  assert.equal(g6.children.filter(node => node.type === 'folder').length, 10);
  assert.equal(folderEntries(tree, 'global6-unit1-writing-s1').filter(node => node.type === 'lesson').length, 4);
  assert.equal(folderEntries(tree, 'global6-unit1-writing-s6').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global6-unit1-writing-final').filter(node => node.type === 'lesson').length, 3);
  assert.equal(folderEntries(tree, 'global6-unit2-writing-sentence-builder').filter(node => node.type === 'folder').length, 6);
  assert.equal(folderEntries(tree, 'global6-unit2-writing-s5').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global6-review-u1-3-present-simple').filter(node => node.type === 'lesson').length, 3);
  assert.equal(folderEntries(tree, 'global6-review-u1-3-present-continuous').filter(node => node.type === 'lesson').length, 3);
  assert.equal(folderEntries(tree, 'global6-review-u1-3-mixed').filter(node => node.type === 'lesson').length, 8);

  const global7 = findAdminTreeNode(tree, 'global7');
  assert.deepEqual(global7.children.filter(node => node.type === 'folder').map(node => node.id), ['global7-unit1', 'global7-unit2', 'global7-unit-review']);
  assert.deepEqual(folderEntries(tree, 'global7-unit1').filter(node => node.type === 'lesson').map(node => node.setId), [
    'g7-u1-translation-01', 'g7-u1-translation-02', 'g7-u1-pronunciation-01'
  ]);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-s1').filter(node => node.type === 'lesson').length, 4);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-s4').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-s10').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global7-unit1-writing-final').filter(node => node.type === 'lesson').length, 3);
  assert.equal(folderEntries(tree, 'global7-unit2-writing-sentence-builder').filter(node => node.type === 'folder').length, 6);
  assert.equal(folderEntries(tree, 'global7-unit2-writing-s3').filter(node => node.type === 'lesson').length, 5);
  assert.equal(folderEntries(tree, 'global7-review-u1-3-present-simple').filter(node => node.type === 'lesson').length, 4);
  assert.equal(folderEntries(tree, 'global7-review-u1-3-mixed').filter(node => node.type === 'lesson').length, 8);
});

test('Explorer breadcrumbs and recursive lesson counts match the hierarchy', () => {
  assert.deepEqual(folderBreadcrumbs(tree, 'global2-unit6-translation').map(item => item.label), ['Bài tập', 'Global Success 2', 'Unit 6', 'Bài tập dịch câu']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global2-writing-u01').map(item => item.label), ['Bài tập', 'Global Success 2', 'Writing Typing Program', 'Unit 1 · At my birthday party']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global3-writing-u20').map(item => item.label), ['Bài tập', 'Global Success 3', 'Writing Typing Program', 'Unit 20 · At the zoo']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-unit1').map(item => item.label), ['Bài tập', 'Global Success 5', 'Unit 1 · All about me!']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-unit2-writing-address').map(item => item.label), ['Bài tập', 'Global Success 5', 'Unit 2 · Our homes', 'Writing · Sentence Builder', '5 · Address']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global5-unit3-writing-be').map(item => item.label), ['Bài tập', 'Global Success 5', 'Unit 3 · My Foreign Friends', 'Writing · Sentence Builder', '5 · BE Question & Short Answer']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global6-unit1-writing-s1').map(item => item.label), ['Bài tập', 'Global Success 6', 'Unit 1 · My New School', 'G6Unit1 Writing Typing', 'Cấu trúc 1 · School Identity']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global6-unit1-mlh-reading').map(item => item.label), ['Bài tập', 'Global Success 6', 'Unit 1 · My New School', 'Reading · Mai Lan Hương']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global6-unit1-mlh-writing').map(item => item.label), ['Bài tập', 'Global Success 6', 'Unit 1 · My New School', 'Writing · Mai Lan Hương']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global6-unit2-writing-s1').map(item => item.label), ['Bài tập', 'Global Success 6', 'Unit 2 · My House', 'Writing · Sentence Builder', 'Cấu trúc 1 · Possessive']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global7-unit1-writing-final').map(item => item.label), ['Bài tập', 'Global Success 7', 'Unit 1 · Hobbies', 'G7Unit1 Writing Typing', 'Final Writing Integration']);
  assert.deepEqual(folderBreadcrumbs(tree, 'global7-unit2-writing-s1').map(item => item.label), ['Bài tập', 'Global Success 7', 'Unit 2 · Healthy Living', 'Writing · Sentence Builder', 'Cấu trúc 1 · Healthy habits & benefits']);

  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global2')), 57);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global2-writing-typing')), 48);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global3')), 88);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global5')), 65);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global5-unit2')), 17);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global5-unit3')), 19);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global6')), 88);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global6-unit1')), 49);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global6-unit2')), 16);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global6-unit-review')), 23);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global7')), 83);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global7-unit2')), 16);
  assert.equal(folderLessonCount(findAdminTreeNode(tree, 'global7-unit-review')), 20);
  assert.equal(folderLessonCount(tree), sets.length);
});

test('Explorer search finds lessons by title, slug, Set id, Unit and activity type', () => {
  assert.ok(searchLessonDescriptors(sets, 'aura').some(set => set.id === 'g6-u1-writing-s4-04'));
  assert.deepEqual(searchLessonDescriptors(sets, 'g2u6-dich-cau-9').map(set => set.id), ['g2-u6-translation-09']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g2u01-writing-01').map(set => set.id), ['g2u01-writing-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g3u20-writing-05').map(set => set.id), ['g3u20-writing-05']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5u1-tu-vung-1').map(set => set.id), ['g5-u1-vocab-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5u2-writing-16').map(set => set.id), ['g5-u2-writing-typing-16']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g5u3-writing-18').map(set => set.id), ['g5-u3-writing-typing-18']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g7u1-dich2-mcq').map(set => set.id), ['g7-u1-translation-02']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-mlh-vocab-context').map(set => set.id), ['g7-u1-mlh-vocab-context-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-mlh-reading-gap-01').map(set => set.id), ['g6-u1-mlh-reading-gap-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-mlh-reading-tf-evidence-01').map(set => set.id), ['g6-u1-mlh-reading-tf-evidence-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-mlh-writing-reorder-01').map(set => set.id), ['g6-u1-mlh-writing-reorder-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-mlh-writing-rewrite-01').map(set => set.id), ['g6-u1-mlh-writing-rewrite-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-mlh-writing-question-words-01').map(set => set.id), ['g6-u1-mlh-writing-question-words-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u1-mlh-writing-dialogue-order-01').map(set => set.id), ['g6-u1-mlh-writing-dialogue-order-01']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g6u2-writing-16').map(set => set.id), ['g6-u2-writing-16']);
  assert.deepEqual(searchLessonDescriptors(sets, 'g7u2-writing-16').map(set => set.id), ['g7-u2-writing-16']);
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g2u01-writing-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g3u01-writing-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g5-u2-writing-typing-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g5-u3-writing-typing-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g6-u1-writing-s1-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g6-u2-writing-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g7-u1-writing-s1-01'));
  assert.ok(searchLessonDescriptors(sets, 'typing').some(set => set.id === 'g7-u2-writing-01'));
});

test('Explorer type filters distinguish single-type lessons from mixed lessons', () => {
  const g2Typing = sets.find(set => set.id === 'g2u01-writing-01');
  const g3Typing = sets.find(set => set.id === 'g3u01-writing-01');
  const g5U2Typing = sets.find(set => set.id === 'g5-u2-writing-typing-01');
  const g5U3Typing = sets.find(set => set.id === 'g5-u3-writing-typing-01');
  const g6Typing = sets.find(set => set.id === 'g6-u1-writing-s1-01');
  const g7Typing = sets.find(set => set.id === 'g7-u1-writing-s1-01');
  const mcq = sets.find(set => set.id === 'g7-u1-translation-01');
  const mixed = sets.find(set => set.id === 'mrt-left-cut-right-01');
  const reviewMixed = sets.find(set => set.id === 'g5-review-u1-5-01');
  const writing = sets.find(set => set.id === 'g5-u1-writing-01');
  const classificationOnly = { activityTypes: ['classification'] };
  assert.equal(lessonMatchesType(g2Typing, 'typing'), true);
  assert.equal(lessonMatchesType(g3Typing, 'typing'), true);
  assert.equal(lessonMatchesType(g5U2Typing, 'typing'), true);
  assert.equal(lessonMatchesType(g5U3Typing, 'typing'), true);
  assert.equal(lessonMatchesType(g6Typing, 'typing'), true);
  assert.equal(lessonMatchesType(g7Typing, 'typing'), true);
  assert.equal(lessonMatchesType(mcq, 'mcq'), true);
  assert.equal(lessonMatchesType(mixed, 'mix'), true);
  assert.equal(lessonMatchesType(mixed, 'mcq'), false);
  assert.equal(lessonMatchesType(reviewMixed, 'mix'), true);
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
