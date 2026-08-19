import test from 'node:test';
import assert from 'node:assert/strict';
import { g5U4WritingRegistry } from '../src/data/g5-u4-writing-typing-catalog.js';
import { g5U5WritingRegistry } from '../src/data/g5-u5-writing-typing-catalog.js';
import { lessonFolders,lessonRegistry } from '../src/data/publishedLessonCatalog.js';
test('G5 U4 + U5 add 35 unique target-first screens',()=>{const all=[...g5U4WritingRegistry,...g5U5WritingRegistry];assert.equal(g5U4WritingRegistry.length,16);assert.equal(g5U5WritingRegistry.length,19);assert.equal(all.length,35);assert.equal(new Set(all.map(x=>x.lessonSlug)).size,35);assert.equal(all.every(x=>x.activityTypes.includes('typing')),true);});
test('U4 and U5 registries remain independent',()=>{assert.equal(g5U4WritingRegistry.some(x=>x.lessonSlug.startsWith('g5u5-')),false);assert.equal(g5U5WritingRegistry.some(x=>x.lessonSlug.startsWith('g5u4-')),false);});
test('published catalog aggregates both units without slug collisions',()=>{assert.equal(lessonRegistry.filter(x=>x.lessonSlug?.startsWith('g5u4-writing-')).length,16);assert.equal(lessonRegistry.filter(x=>x.lessonSlug?.startsWith('g5u5-writing-')).length,19);const slugs=lessonRegistry.map(x=>x.lessonSlug).filter(Boolean);assert.equal(new Set(slugs).size,slugs.length);assert.equal(lessonFolders.find(x=>x.id==='global5-unit4')?.parentId,'global5');assert.equal(lessonFolders.find(x=>x.id==='global5-unit5')?.parentId,'global5');});
