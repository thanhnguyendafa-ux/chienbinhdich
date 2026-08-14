import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessonContentDocumentFor, normalizeLessonContentRecord } from '../src/repositories/lessonContentModel.js';
import { applyLessonContentOverride } from '../src/services/effectiveLessonService.js';
import { isEditableStagedTypingLesson, validateTypingDraft } from '../src/features/admin/typing/typingContentDraft.js';

const studentContentReader = readFileSync(new URL('../src/repositories/lessonContentReader.js', import.meta.url), 'utf8');
const adminContentRepository = readFileSync(new URL('../src/repositories/adminLessonContentRepository.js', import.meta.url), 'utf8');

test('lesson content model creates immutable numbered revisions', () => {
  const document = lessonContentDocumentFor({
    setId: 'g2u01-writing-01',
    revision: 3,
    baseVersion: 1,
    items: [{ id: 'w1', stage: 'word', vi: 'bánh pizza', en: 'the pizza', buildsFrom: [] }],
    updatedBy: 'admin-1',
    updatedAt: 1234
  });
  assert.equal(document.revisionId, 'r0003');
  const normalized = normalizeLessonContentRecord('g2u01-writing-01', document);
  assert.equal(normalized.revision, 3);
  assert.equal(normalized.active, true);
  assert.equal(normalized.items[0].en, 'the pizza');
  assert.throws(() => { normalized.items.push({}); });
});

test('effective lesson falls back to base and applies admin content revision when present', () => {
  const base = { id: 'lesson', version: 2, itemCount: 1, items: [{ id: 'base', stage: 'word', vi: 'pizza', en: 'pizza' }] };
  const fallback = applyLessonContentOverride(base, null);
  assert.equal(fallback.contentPolicy.source, 'base');
  assert.equal(fallback.contentPolicy.revision, 0);
  assert.equal(fallback.items[0].en, 'pizza');

  const current = applyLessonContentOverride(base, {
    revision: 4,
    revisionId: 'r0004',
    baseVersion: 1,
    items: [{ id: 'base', stage: 'word', vi: 'bánh pizza', en: 'the pizza' }],
    updatedAt: 99,
    updatedBy: 'admin'
  });
  assert.equal(current.contentPolicy.source, 'admin-override');
  assert.equal(current.contentPolicy.revision, 4);
  assert.equal(current.contentPolicy.baseChanged, true);
  assert.equal(current.itemCount, 1);
  assert.equal(current.items[0].en, 'the pizza');
});

test('Typing content editor is offered only for staged Typing lessons', () => {
  assert.equal(isEditableStagedTypingLesson({ activityTypes: ['typing'], items: [{ stage: 'word' }, { stage: 'sentence' }] }), true);
  assert.equal(isEditableStagedTypingLesson({ activityTypes: ['typing'], items: [{ vi: 'x', en: 'y' }] }), false);
  assert.equal(isEditableStagedTypingLesson({ activityTypes: ['mcq'], items: [{ stage: 'sentence' }] }), false);
});

test('typing draft rebuilds WORD → PHRASE → SENTENCE dependencies after manual edits', () => {
  const lesson = { id: 'lesson', passThreshold: 80 };
  const draft = [
    { id: 'w1', stage: 'word', vi: 'bánh pizza', en: 'the pizza', buildsFrom: [] },
    { id: 'p1', stage: 'phrase', vi: 'bánh pizza ngon', en: 'the pizza is yummy', buildsFrom: [] },
    { id: 's1', stage: 'sentence', vi: 'Pizza ngon.', en: 'The pizza is yummy.', buildsFrom: [] }
  ];
  const result = validateTypingDraft(lesson, draft);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.items[1].buildsFrom, ['w1']);
  assert.deepEqual(result.items[2].buildsFrom, ['w1', 'p1']);
});

test('typing draft blocks empty, orphaned scaffold, and missing sentence targets before publish', () => {
  const lesson = { id: 'lesson', passThreshold: 80 };
  const empty = validateTypingDraft(lesson, [{ id: 'w1', stage: 'word', vi: 'pizza', en: '', buildsFrom: [] }]);
  assert.ok(empty.errors.some(error => error.includes('Typing item không hợp lệ')));
  assert.ok(empty.errors.some(error => error.includes('ít nhất một SENTENCE')));

  const orphan = validateTypingDraft(lesson, [
    { id: 'w1', stage: 'word', vi: 'bánh pizza', en: 'the pizza', buildsFrom: [] },
    { id: 'p1', stage: 'phrase', vi: 'rất ngon', en: 'very yummy', buildsFrom: [] },
    { id: 's1', stage: 'sentence', vi: 'Pizza ngon.', en: 'The pizza is yummy.', buildsFrom: [] }
  ]);
  assert.ok(orphan.errors.some(error => error.includes('PHRASE p1 không xuất hiện')));
});

test('current-content reads can use Base Content while new Firestore rules are pending, but historical revisions never silently fall back', () => {
  assert.match(studentContentReader, /Lesson Content CMS rules are not available yet; using Base Content/);
  assert.match(studentContentReader, /if \(isPermissionDenied\(error\)\)[\s\S]*return null/);
  const historicalSection = studentContentReader.match(/async getRevisionContent[\s\S]*?\n    }\n/)?.[0] ?? '';
  assert.doesNotMatch(historicalSection, /isPermissionDenied|using Base Content/);
});

test('Admin content writes report missing Firestore rules instead of breaking the lesson inspector', () => {
  assert.match(adminContentRepository, /Content CMS chưa được bật trên Firestore/);
  assert.match(adminContentRepository, /lesson_content_rules_unavailable/);
  assert.match(adminContentRepository, /async getCurrentContent[\s\S]*isPermissionDenied\(error\)[\s\S]*return null/);
});
