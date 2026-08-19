import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonFolders } from '../src/data/publishedLessonCatalog.js';
import { listSetDescriptors } from '../src/repositories/lessonRepository.js';
import { buildAdminLessonTree,findAdminTreeNode,folderBreadcrumbs,folderEntries,folderLessonCount,lessonMatchesType,rootFolderId,searchLessonDescriptors } from '../src/features/admin/adminTreeModel.js';
const sets=listSetDescriptors();const tree=buildAdminLessonTree(lessonFolders,sets);

test('Explorer tree nests Global Success units including G5 U4/U5',()=>{
 assert.equal(tree.id,rootFolderId());
 assert.deepEqual(tree.children.filter(n=>n.type==='folder').map(n=>n.id),['samples','global2','global3','global5','global6','global7','mrt-lessons']);
 assert.deepEqual(findAdminTreeNode(tree,'global2').children.filter(n=>n.type==='folder').map(n=>n.id),['global2-unit6','global2-writing-typing']);
 assert.equal(findAdminTreeNode(tree,'global3-writing-typing').children.filter(n=>n.type==='folder').length,20);
 assert.deepEqual(findAdminTreeNode(tree,'global5').children.filter(n=>n.type==='folder').map(n=>n.id),['global5-unit1','global5-unit2','global5-unit3','global5-unit4','global5-unit5','global5-review-u1-5','global5-review']);
 assert.equal(folderEntries(tree,'global5-review-u1-5').filter(n=>n.type==='lesson').length,10);
 assert.equal(folderEntries(tree,'global5-unit2-writing-typing').filter(n=>n.type==='folder').length,5);
 assert.equal(folderEntries(tree,'global5-unit3-writing-typing').filter(n=>n.type==='folder').length,6);
 assert.equal(folderEntries(tree,'global5-unit3-writing-personality').filter(n=>n.type==='lesson').length,6);
 assert.equal(folderEntries(tree,'global5-unit4-writing-typing').filter(n=>n.type==='folder').length,5);
 assert.equal(folderEntries(tree,'global5-unit4-writing-qb').filter(n=>n.type==='lesson').length,1);
 assert.equal(folderEntries(tree,'global5-unit4-writing-like').filter(n=>n.type==='lesson').length,6);
 assert.equal(folderEntries(tree,'global5-unit5-writing-typing').filter(n=>n.type==='folder').length,7);
 assert.equal(folderEntries(tree,'global5-unit5-writing-qb').filter(n=>n.type==='lesson').length,1);
 assert.equal(folderEntries(tree,'global5-unit5-writing-choice').filter(n=>n.type==='lesson').length,6);
 assert.equal(folderEntries(tree,'global5-unit5-writing-reasons').filter(n=>n.type==='lesson').length,5);
 const global6=findAdminTreeNode(tree,'global6');assert.deepEqual(global6.children.filter(n=>n.type==='folder').map(n=>n.id),['global6-unit1','global6-unit2','global6-unit-review']);
 assert.equal(folderEntries(tree,'global6-unit1-writing-s1').filter(n=>n.type==='lesson').length,4);assert.equal(folderEntries(tree,'global6-unit2-writing-s5').filter(n=>n.type==='lesson').length,5);
 const global7=findAdminTreeNode(tree,'global7');assert.deepEqual(global7.children.filter(n=>n.type==='folder').map(n=>n.id),['global7-unit1','global7-unit2','global7-unit-review']);
 assert.equal(folderEntries(tree,'global7-unit1-writing-s1').filter(n=>n.type==='lesson').length,4);assert.equal(folderEntries(tree,'global7-unit2-writing-s3').filter(n=>n.type==='lesson').length,5);
});

test('Explorer breadcrumbs and recursive counts include G5 U4/U5',()=>{
 assert.deepEqual(folderBreadcrumbs(tree,'global5-unit2-writing-address').map(x=>x.label),['Bài tập','Global Success 5','Unit 2 · Our homes','Writing · Sentence Builder','5 · Address']);
 assert.deepEqual(folderBreadcrumbs(tree,'global5-unit3-writing-be').map(x=>x.label),['Bài tập','Global Success 5','Unit 3 · My Foreign Friends','Writing · Sentence Builder','5 · BE Question & Short Answer']);
 assert.deepEqual(folderBreadcrumbs(tree,'global5-unit4-writing-frequency-question').map(x=>x.label),['Bài tập','Global Success 5','Unit 4 · Our Free Time Activities','Writing · Sentence Builder','4 · Frequency Question']);
 assert.deepEqual(folderBreadcrumbs(tree,'global5-unit5-writing-short-answer').map(x=>x.label),['Bài tập','Global Success 5','Unit 5 · My Future Job','Writing · Sentence Builder','6 · Would Short Answers']);
 assert.equal(folderLessonCount(findAdminTreeNode(tree,'global2')),57);assert.equal(folderLessonCount(findAdminTreeNode(tree,'global3')),88);
 assert.equal(folderLessonCount(findAdminTreeNode(tree,'global5')),100);assert.equal(folderLessonCount(findAdminTreeNode(tree,'global5-unit2')),17);assert.equal(folderLessonCount(findAdminTreeNode(tree,'global5-unit3')),19);assert.equal(folderLessonCount(findAdminTreeNode(tree,'global5-unit4')),16);assert.equal(folderLessonCount(findAdminTreeNode(tree,'global5-unit5')),19);
 assert.equal(folderLessonCount(findAdminTreeNode(tree,'global6')),88);assert.equal(folderLessonCount(findAdminTreeNode(tree,'global7')),83);assert.equal(folderLessonCount(tree),sets.length);
});

test('Explorer search finds new and existing lessons',()=>{
 assert.deepEqual(searchLessonDescriptors(sets,'g5u2-writing-16').map(x=>x.id),['g5-u2-writing-typing-16']);
 assert.deepEqual(searchLessonDescriptors(sets,'g5u3-writing-18').map(x=>x.id),['g5-u3-writing-typing-18']);
 assert.deepEqual(searchLessonDescriptors(sets,'g5u4-writing-15').map(x=>x.id),['g5-u4-writing-typing-15']);
 assert.deepEqual(searchLessonDescriptors(sets,'g5u5-writing-18').map(x=>x.id),['g5-u5-writing-typing-18']);
 assert.ok(searchLessonDescriptors(sets,'typing').some(x=>x.id==='g5-u4-writing-typing-01'));assert.ok(searchLessonDescriptors(sets,'typing').some(x=>x.id==='g5-u5-writing-typing-01'));
 assert.ok(searchLessonDescriptors(sets,'typing').some(x=>x.id==='g6-u1-writing-s1-01'));assert.ok(searchLessonDescriptors(sets,'typing').some(x=>x.id==='g7-u1-writing-s1-01'));
});

test('Explorer type filters include new typing lessons',()=>{
 const ids=['g2u01-writing-01','g3u01-writing-01','g5-u2-writing-typing-01','g5-u3-writing-typing-01','g5-u4-writing-typing-01','g5-u5-writing-typing-01','g6-u1-writing-s1-01','g7-u1-writing-s1-01'];for(const id of ids)assert.equal(lessonMatchesType(sets.find(x=>x.id===id),'typing'),true);
 const mixed=sets.find(x=>x.id==='mrt-left-cut-right-01');assert.equal(lessonMatchesType(mixed,'mix'),true);assert.equal(lessonMatchesType(mixed,'mcq'),false);assert.equal(lessonMatchesType({activityTypes:['classification']},'classify'),true);
});

test('every published Set appears exactly once in Explorer',()=>{const found=[];const visit=n=>{for(const c of n.children??[]){if(c.type==='lesson')found.push(c.setId);else visit(c);}};visit(tree);assert.deepEqual([...found].sort(),sets.map(x=>x.id).sort());assert.equal(new Set(found).size,found.length);});
