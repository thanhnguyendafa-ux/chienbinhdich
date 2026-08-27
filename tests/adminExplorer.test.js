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

test('Explorer keeps the top-level curriculum tree and nests workbook folders',()=>{
  assert.equal(tree.id,rootFolderId());
  assert.deepEqual(folderChildren(rootFolderId()),['samples','global2','global3','global5','global6','global7','mrt-lessons']);
  assert.deepEqual(folderChildren('global6'),['global6-unit1','global6-unit2','global6-unit3','global6-unit4','global6-unit5','global6-unit6','global6-unit7','global6-unit8','global6-unit9','global6-unit10','global6-unit11','global6-unit12','global6-unit-review','global6-test-yourself-3','global6-test-yourself-4']);
  assert.ok(folderChildren('global6-unit1').includes('global6-unit1-vocab-typing'));
  assert.deepEqual(folderChildren('global7'),['global7-unit1','global7-unit2','global7-unit3','global7-unit-review']);
  assert.deepEqual(folderChildren('global7-unit1').includes('global7-unit1-workbook'),true);
  assert.deepEqual(folderChildren('global7-unit2'),['global7-unit2-writing-sentence-builder','global7-unit2-workbook']);
  assert.deepEqual(folderChildren('global7-unit3'),['global7-unit3-workbook']);
  assert.equal(lessonIds('global7-unit1-workbook').length,12);
  assert.equal(lessonIds('global7-unit2-workbook').length,16);
  assert.equal(lessonIds('global7-unit3-workbook').length,17);
});

test('Explorer retains legacy contracts and exposes G2 G3 workbook roots',()=>{
  assert.deepEqual(folderChildren('global2'),['global2-workbook','global2-unit6','global2-writing-typing']);
  assert.deepEqual(folderChildren('global3'),['global3-writing-typing','global3-workbook']);
  assert.equal(lessonIds('global2-workbook-u01').length,1);
  assert.equal(lessonIds('global3-workbook-u01').length,1);
  assert.equal(lessonIds('global3-workbook-sc01').length,1);
  assert.ok(folderChildren('global5').includes('global5-unit10'));
  assert.deepEqual(folderChildren('global6-unit3'),['global6-unit3-workbook']);
  assert.equal(lessonIds('global6-unit1-workbook').length,15);
  assert.equal(lessonIds('global6-unit2-workbook').length,14);
  assert.equal(lessonIds('global6-unit3-workbook').length,15);
  assert.equal(lessonIds('global6-unit4-workbook').length,14);
  assert.equal(lessonIds('global6-unit5-workbook').length,19);
  assert.equal(lessonIds('global6-unit6-workbook').length,16);
  assert.equal(lessonIds('global6-unit7-workbook').length,17);
  assert.equal(lessonIds('global6-unit8-workbook').length,18);
  assert.equal(lessonIds('global6-unit9-workbook').length,17);
  assert.equal(lessonIds('global6-unit10-workbook').length,18);
  assert.equal(lessonIds('global6-unit11-workbook').length,16);
  assert.equal(lessonIds('global6-unit12-workbook').length,18);
  assert.ok(lessonIds('global6-unit1-workbook').includes('g6-u1-wb-c2'));
  assert.ok(lessonIds('global6-unit2-workbook').includes('g6-u2-wb-b2'));
  assert.ok(lessonIds('global6-unit2-workbook').includes('g6-u2-wb-e3'));
  assert.ok(lessonIds('global6-unit12-workbook').includes('g6-u12-wb-d2'));
  assert.deepEqual(lessonIds('global7-unit1').slice(0,3),['g7-u1-translation-01','g7-u1-translation-02','g7-u1-pronunciation-01']);
});

test('Explorer breadcrumbs include G2 G3 workbooks, G6 U4-U12 and all three G7 workbook units',()=>{
  assert.deepEqual(folderBreadcrumbs(tree,'global2-workbook-u01').map(item=>item.label),['Bài tập','Global Success 2','Sách bài tập','Unit 1 · At my birthday party']);
  assert.deepEqual(folderBreadcrumbs(tree,'global3-workbook-u01').map(item=>item.label),['Bài tập','Global Success 3','Sách bài tập','Unit 1 · Hello']);
  assert.deepEqual(folderBreadcrumbs(tree,'global7-unit1-workbook').map(item=>item.label),['Bài tập','Global Success 7','Unit 1 · Hobbies','Sách bài tập · Unit 1']);
  assert.deepEqual(folderBreadcrumbs(tree,'global7-unit2-workbook').map(item=>item.label),['Bài tập','Global Success 7','Unit 2 · Healthy Living','Sách bài tập · Unit 2']);
  assert.deepEqual(folderBreadcrumbs(tree,'global7-unit3-workbook').map(item=>item.label),['Bài tập','Global Success 7','Unit 3 · Community Service','Sách bài tập · Unit 3']);
  assert.deepEqual(folderBreadcrumbs(tree,'global6-unit3-workbook').map(item=>item.label),['Bài tập','Global Success 6','Unit 3 · My Friends','Sách bài tập · Unit 3']);
  assert.deepEqual(folderBreadcrumbs(tree,'global6-unit12-workbook').map(item=>item.label),['Bài tập','Global Success 6','Unit 12 · Robots','Sách bài tập · Unit 12']);
});

test('Explorer recursive lesson counts include complete G2 G3 G5 G6 G7 workbook lessons',()=>{
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global2-workbook')),16);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global3-workbook')),24);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global2')),73);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global3')),112);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global5')),442);
  assert.equal(folderLessonCount(findAdminTreeNode(tree,'global6')),330);
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
  assert.deepEqual(searchLessonDescriptors(sets,'g2-u01-wb').map(set=>set.id),['g2-u01-wb']);
  assert.deepEqual(searchLessonDescriptors(sets,'g3-sc01-wb').map(set=>set.id),['g3-sc01-wb']);
  assert.deepEqual(searchLessonDescriptors(sets,'g7-u2-wb-d2').map(set=>set.id),['g7-u2-wb-d2']);
  assert.deepEqual(searchLessonDescriptors(sets,'g7-u3-wb-d3').map(set=>set.id),['g7-u3-wb-d3']);
  assert.deepEqual(searchLessonDescriptors(sets,'g6-u1-wb-c2').map(set=>set.id),['g6-u1-wb-c2']);
  assert.deepEqual(searchLessonDescriptors(sets,'g6-u12-wb-d2').map(set=>set.id),['g6-u12-wb-d2']);
  assert.deepEqual(searchLessonDescriptors(sets,'g6-u1-vocab-typing-01').map(set=>set.id),['g6-u1-vocab-typing-01']);
  assert.ok(searchLessonDescriptors(sets,'typing').some(set=>set.id==='g7-u2-wb-b3'));
  assert.ok(searchLessonDescriptors(sets,'classification').some(set=>set.id==='g6-u2-wb-b2'));
});

test('Explorer type filters still distinguish single-type and mixed lessons',()=>{
  for(const id of ['g2u01-writing-01','g3u01-writing-01','g6-u1-writing-s1-01','g6-u1-vocab-typing-01','g7-u1-writing-s1-01']) assert.equal(lessonMatchesType(sets.find(set=>set.id===id),'typing'),true);
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
