import test from 'node:test';
import assert from 'node:assert/strict';
import { listSetDescriptors, loadLessonSet } from '../src/repositories/lessonRepository.js';
import {
  appendDraftItem,
  createUniversalDraft,
  isUniversalContentEditableLesson,
  validateUniversalDraft
} from '../src/features/admin/content/universalContentDraft.js';
import { lessonContentDocumentFor, normalizeLessonContentRecord } from '../src/repositories/lessonContentModel.js';
import { applyLessonContentOverride } from '../src/services/effectiveLessonService.js';

const clone = value => structuredClone(value);

test('every published lesson using native question types is editable by Universal Content CMS', async () => {
  const descriptors = listSetDescriptors();
  assert.ok(descriptors.length > 0);
  for (const descriptor of descriptors) {
    const lesson = await loadLessonSet(descriptor.id);
    assert.equal(isUniversalContentEditableLesson(lesson), true, descriptor.id);
    const draft = createUniversalDraft(lesson);
    const result = validateUniversalDraft(lesson, draft);
    assert.deepEqual(result.errors, [], descriptor.id);
    assert.equal(result.content.items.length, lesson.items.length, descriptor.id);
  }
});

test('pronunciation MIX lesson keeps theory, classification analysis and print groups editable', async () => {
  const lesson = await loadLessonSet('g7-u1-pronunciation-01');
  const draft = createUniversalDraft(lesson);
  const classification = draft.items.find(item => item.type === 'classification');
  assert.ok(classification);
  assert.equal(classification.theorySupport.access, 'after_submit');
  assert.equal(classification.teachingFeedback.answerAnalysis.length, classification.tokens.length);

  classification.prompt = 'Classify these words. / Hãy phân loại các từ này.';
  classification.teachingFeedback.theory = 'Updated theory / Lý thuyết đã chỉnh.';
  classification.tokens[0].text = 'girl';
  classification.teachingFeedback.answerAnalysis[0].word = 'girl';

  const result = validateUniversalDraft(lesson, draft);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(
    result.content.printGroups.flatMap(group => group.itemIds),
    result.content.items.map(item => item.id)
  );
});

test('Universal Content CMS can add a valid MCQ while keeping print-group coverage', async () => {
  const lesson = await loadLessonSet('g7-u1-pronunciation-01');
  let draft = createUniversalDraft(lesson);
  draft = appendDraftItem(lesson, draft, 'mcq', draft.printGroups.at(-1).id);
  const added = draft.items.at(-1);
  added.prompt = 'Which sound is schwa? / Âm nào là schwa?';
  added.choices = [{ id: 'a', text: '/ə/' }, { id: 'b', text: '/ɜː/' }];
  added.correctChoiceId = 'a';
  const result = validateUniversalDraft(lesson, draft);
  assert.deepEqual(result.errors, []);
  assert.equal(result.content.items.length, lesson.items.length + 1);
  assert.deepEqual(
    result.content.printGroups.flatMap(group => group.itemIds),
    result.content.items.map(item => item.id)
  );
});

test('lesson content revisions round-trip passages and printGroups without breaking legacy item-only records', async () => {
  const reading = await loadLessonSet('g5-review-main-idea-01');
  assert.ok(reading.passages?.length > 0);
  const readingDraft = createUniversalDraft(reading);
  readingDraft.passages[0].text = `${readingDraft.passages[0].text} Updated.`;
  const readingResult = validateUniversalDraft(reading, readingDraft);
  assert.deepEqual(readingResult.errors, []);

  const readingDocument = lessonContentDocumentFor({
    setId: reading.id,
    revision: 2,
    baseVersion: reading.version,
    items: readingResult.content.items,
    passages: readingResult.content.passages,
    updatedBy: 'admin-1',
    updatedAt: 1234
  });
  const normalizedReading = normalizeLessonContentRecord(reading.id, readingDocument);
  assert.equal(normalizedReading.passages[0].text.endsWith('Updated.'), true);
  const effectiveReading = applyLessonContentOverride(reading, normalizedReading);
  assert.equal(effectiveReading.passages[0].text.endsWith('Updated.'), true);

  const pronunciation = await loadLessonSet('g7-u1-pronunciation-01');
  const printDocument = lessonContentDocumentFor({
    setId: pronunciation.id,
    revision: 3,
    baseVersion: pronunciation.version,
    items: clone(pronunciation.items),
    printGroups: clone(pronunciation.printGroups),
    updatedBy: 'admin-1',
    updatedAt: 5678
  });
  const normalizedPrint = normalizeLessonContentRecord(pronunciation.id, printDocument);
  const effectivePrint = applyLessonContentOverride(pronunciation, normalizedPrint);
  assert.deepEqual(effectivePrint.printGroups, pronunciation.printGroups);

  const legacy = normalizeLessonContentRecord('legacy', {
    setId: 'legacy', revision: 1, revisionId: 'r0001', baseVersion: 1, active: true,
    items: [{ id: 'q1', type: 'mcq', prompt: 'Q', choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctChoiceId: 'a' }],
    updatedAt: 1, updatedBy: 'admin'
  });
  assert.equal('passages' in legacy, false);
  assert.equal('printGroups' in legacy, false);
});
