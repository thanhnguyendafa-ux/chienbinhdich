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
const folderChildren = id => findAdminTreeNode(tree,id).children.filter(node=>node.type==='folder').map(node=>node.id);
const lessonIds = id => folderEntries(tree,id).filter(node=>node.type==='lesson').map(node=>node.setId);

test('Explorer keeps the top-level curriculum tree and nests new G7 workbook folders',()=>{
  assert.equal(tree.id,rootFolderId());
  assert.deepEqual(folderChildren(rootFolderId()),['samples','global2','global3','global5','global6','global7','mrt-lessons']);
  assert.deepEqual(folderChildren('global6'),['global6-unit1','global6-unit2','global6-unit3','global6-unit-review']);
  assert.deepEqual(folderChildren('global7'),['global7-unit1','global7-unit2','global7-unit3','global7-unit-review']);
  assert.deepEqual(folderChildren('global7-unit1').includes('global7-unit1-workbook'),true);
  assert.deepEqual(folderChildren('global7-unit2'),['global7-unit2-writing-sentence-builder','global7-unit2-workbook']);
  assert.deepEqual(folderChildren('global7-unit3'),['global7-unit3-workbook']);
  assert.equal(lessonIds('global7-unit1-workbook').length,12);
  assert.equal(lessonIds('global7-unit2-workbook').length,16);
  assert.equal(lessonIds('global7-unit3-workbook').length,17);
});

test('Explorer retains representative legacy folder contracts',()=>{
  assert.deepEqual(folderChildren('global2'),['global2-unit6','global2-writing-typing']);
  assert.deepEqual(folderChildren('global3'),['global3-writing-typing']);
  assert.ok(folderChildren('global5').includes('global5-unit10'));
  assert.deepEqual(folderChildren('global6-unit3'),['global6-unit3-workbook']);
  assert.equal(lessonIds('global6-unit1-workbook').length,14);
  assert.equal(lessonIds('global6-unit2-workbook').length,12);
  assert.equal(lessonIds('global6-unit3-workbook').length,15);
  assert.deepEqual(lessonIds('global7-unit1').slice(0,3),['g7-u1-translation-01','g7-u1-translation-02','g7-u1-pronunciation-01']);
});

test('Explorer breadcrumbs include all three G7 workbook units',()=>{
  assert.deepEqual(folderBreadcrumbs(tree,'global7-unit1-workbook').map(item=>item.label),['Bài tập','Global Success 7','Unit 1 · Hobbies','Sách bài tập · Unit 1']);
  assert.deepEqual(folderBreadcrumbs(tree,'global7-unit2-workbook').map(item=>item.label),['Bài tập','Global Success 7','Unit 2 · Healthy Living','Sách bài tập · Unit 2']);
  assert.deepEqual(folderBreadcrumbs(tree,'global7-unit3-workbook').map(item=>item.label),['Bài tập','Global Success 7','Unit 3 · Community Service','Sách bài tập · Unit 3']);
  assert.deepEqual(folderBreadcrumbs(tree,'global6-unit3-workbook').map(item=>item.label),['Bài tập','Global Success 6','Unit 3 · My Friends','Sách bài tập · Unit 3']);
});

test('Explorer recursive lesson counts include G7 U2 and U3 without changing other curriculum totals',()=>{
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global2')),57);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global3')),88);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global5')),301);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global6')),150);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7-unit1')),59);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7-unit1-workbook')),12);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7-unit2')),32);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7-unit2-workbook')),16);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7-unit3')),17);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7-unit3-workbook')),17);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7-unit-review')),20);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7')),128);
  assert.equal(folderLessonCount(tree),sets.length);
});

test('Explorer search finds legacy and new workbook lessons by title, slug, id and activity type',()=>{
  assert.ok(searchLessonDescriptors(sets,'aura').some(set=>set.id==='g6-u1-writing-s4-04'));
  assert.deepEqual(searchLessonDescriptors(sets,'g2u6-dich-cau-9').map(set=>set.id),['g2-u6-translation-09']);
  assert.deepEqual(searchLessonDescriptors(sets,'g7u2-writing-16').map(set=>set.id),['g7-u2-writing-16']);
  assert.deepEqual(searchLessonDescriptors(sets,'g7-u2-wb-d2').map(set=>set.id),['g7-u2-wb-d2']);
  assert.deepEqual(searchLessonDescriptors(sets,'g7-u3-wb-d3').map(set=>set.id),['g7-u3-wb-d3']);
  assert.ok(searchLessonDescriptors(sets,'typing').some(set=>set.id==='g7-u2-wb-b3'));
  assert.ok(searchLessonDescriptors(sets,'classification').some(set=>set.id==='g7-u3-wb-c2'));
});

test('Explorer type filters still distinguish single-type and mixed lessons',()=>{
  for(const id of ['g2u01-writing-01','g3u01-writing-01','g6-u1-writing-s1-01','g7-u1-writing-s1-01']) assert.equal(lessonMatchesType(sets.find(set=>set.id===id),'typing'),true);
  assert.equal(lessonMatchesType(sets.find(set=>set.id==='g7-u1-translation-01'),'mcq'),true);
  assert.equal(lessonMatchesType(sets.find(set=>set.id==='mrt-left-cut-right-01'),'mix'),true);
  assert.equal(lessonMatchesType(sets.find(set=>set.id==='g7-u2-wb-b5'),'mix'),true);
  assert.equal(lessonMatchesType(sets.find(set=>set.id==='g7-u3-wb-c2'),'mix'),true);
  assert.equal(lessonMatchesType({activityTypes:['classification']},'classify'),true);
});

test('every published Set appears exactly once in the Explorer tree',()=>{
  const found=[];
  const visit=node=>{for(const child of node.children??[]){if(child.type==='lesson')found.push(child.setId);else visit(child);}};
  visit(tree);
  assert.deepEqual([...found].sort(),sets.map(set=>set.id).sort());
  assert.equal(new Set(found).size,found.length);
});
