import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U2TrapSource } from '../src/data/g6-u2-trap-source.js';
import { getG6U2TrapContent } from '../src/data/g6-u2-trap-content.js';
import { g6U2TrapFolders, g6U2TrapRegistry } from '../src/data/g6-u2-trap-catalog.js';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const EXPECTED_CHOICE_IDS = Object.freeze([
  'correct',
  'wrong-reason-1',
  'wrong-reason-2',
  'wrong-repair'
]);

const learnerText = item => JSON.stringify({
  prompt: item.prompt,
  stimulus: item.stimulus,
  choices: item.choices?.map(choice => ({ text: choice.text, feedback: choice.feedback })),
  teachingFeedback: item.teachingFeedback
});

const choiceLearnerText = item => JSON.stringify(item.choices?.map(choice => ({
  text: choice.text,
  feedback: choice.feedback,
  diagnostic: choice.diagnostic
})));

const ADULT_JARGON = /\b(category|context|referent|verdict|marker|skeleton|evidence|keywords?|slot|transcript|spelling|chunks?)\b|speech function|hòa hợp|agreement/i;

test('GS6 Unit 2 Trap Diagnosis publishes 21 lessons / 238 four-choice MCQ items', async () => {
  assert.equal(g6U2TrapSource.length, 21);
  assert.equal(g6U2TrapRegistry.length, 21);
  assert.equal(g6U2TrapRegistry.reduce((sum, entry) => sum + entry.itemCount, 0), 238);

  const publishedTrapRegistry = lessonRegistry.filter(entry => entry.id.startsWith('g6-u2-trap-'));
  assert.equal(publishedTrapRegistry.length, 21);

  const publishedFolderIds = new Set(lessonFolders.map(folder => folder.id));
  for (const folder of g6U2TrapFolders) assert.ok(publishedFolderIds.has(folder.id), folder.id);

  for (const descriptor of g6U2TrapRegistry) {
    assert.equal(descriptor.version, 2, descriptor.id);
    assert.equal(descriptor.subtitle, '4 lựa chọn · Sai – Sửa – Vì · Có lý thuyết', descriptor.id);
    const resolved = getSetDescriptorBySlug(descriptor.lessonSlug);
    assert.ok(resolved, descriptor.lessonSlug);
    assert.equal(resolved.id, descriptor.id);
    assert.deepEqual(resolved.activityTypes, ['mcq']);

    const set = await loadLessonSet(descriptor.id);
    assert.deepEqual(validateSet(set), [], descriptor.id);
    assert.equal(set.items.length, descriptor.itemCount);
  }
});

test('every Trap Diagnosis item has four short, complete Sai · Sửa · Vì choices', () => {
  let totalItems = 0;

  for (const lesson of g6U2TrapSource) {
    const content = getG6U2TrapContent(lesson.key);
    totalItems += content.items.length;

    for (const item of content.items) {
      assert.equal(item.type, 'mcq', item.id);
      assert.equal(item.correctChoiceId, 'correct', item.id);
      assert.equal(item.choices.length, 4, item.id);
      assert.equal(item.theorySupport?.access, 'anytime', item.id);
      assert.equal(typeof item.exactCorpusRequired, 'boolean', item.id);
      assert.equal(item.passageId, undefined, `${item.id} must stay on the diagnostic MCQ flow`);

      const ids = item.choices.map(choice => choice.id).sort();
      assert.deepEqual(ids, [...EXPECTED_CHOICE_IDS].sort(), item.id);
      assert.equal(new Set(item.choices.map(choice => choice.text)).size, 4, `${item.id} duplicate choice text`);

      for (const choice of item.choices) {
        assert.match(choice.text, /^Sai: .+ · Sửa: .+ · Vì: .+$/s, `${item.id}/${choice.id}`);
        assert.ok(choice.text.length <= 215, `${item.id}/${choice.id} choice too long for grade 4: ${choice.text.length}`);
        assert.ok(choice.feedback?.trim(), `${item.id}/${choice.id} missing feedback`);
        assert.ok(choice.feedback.length <= 65, `${item.id}/${choice.id} feedback too long`);
        assert.ok(choice.diagnostic?.error?.trim(), `${item.id}/${choice.id} missing diagnostic error`);
        assert.ok(choice.diagnostic?.repair?.trim(), `${item.id}/${choice.id} missing diagnostic repair`);
        assert.ok(choice.diagnostic?.reason?.trim(), `${item.id}/${choice.id} missing diagnostic reason`);
        assert.ok(choice.diagnostic.reason.trim().split(/\s+/).length <= 14, `${item.id}/${choice.id} reason has too many words`);
      }

      const correct = item.choices.find(choice => choice.id === 'correct');
      assert.equal(correct?.diagnostic?.role, 'correct', `${item.id} correct role mismatch`);
      assert.deepEqual({
        error: correct?.diagnostic?.error,
        repair: correct?.diagnostic?.repair,
        reason: correct?.diagnostic?.reason
      }, item.diagnosticSpec, `${item.id} correct diagnostic mismatch`);

      const sameRepairCount = item.choices.filter(choice => choice.diagnostic.repair === correct.diagnostic.repair).length;
      assert.equal(sameRepairCount, 3, `${item.id} must keep three near choices with the same repair`);

      for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
        assert.ok(item.teachingFeedback?.[field]?.trim(), `${item.id} missing teachingFeedback.${field}`);
      }
      assert.notEqual(item.teachingFeedback.example, item.sourceEvidence, `${item.id} anytime theory must not copy the current evidence answer`);

      if (String(item.trapCode).startsWith('R-')) {
        assert.ok(item.stimulus?.text?.trim(), `${item.id} Reading trap must include passage data`);
        assert.match(item.stimulus?.title ?? '', /^Đọc:/, `${item.id} Reading title must be child-friendly`);
        assert.equal(item.prompt, 'Bạn này sai ở đâu? Chọn giải thích đúng.', item.id);
        assert.doesNotMatch(item.stimulus?.title ?? '', /paraphrase|reference|detail|number|mcq/i, `${item.id} Reading title contains adult exam jargon`);
      }

      assert.doesNotMatch(learnerText(item), /\bNP\b|noun phrase/i, `${item.id} must use child-friendly Vietnamese`);
      assert.doesNotMatch(choiceLearnerText(item), ADULT_JARGON, `${item.id} choices must avoid adult diagnostic jargon`);
      assert.doesNotMatch(item.teachingFeedback.theory, ADULT_JARGON, `${item.id} theory must stay grade-4 friendly`);
    }
  }

  assert.equal(totalItems, 238);
});

test('grade 4 theory is always available and stays focused on Unit 2 learning rules', () => {
  const representativeKeys = [
    'vocab-context-01',
    'grammar-there-01',
    'grammar-suggestion-01',
    'reading-detail-01',
    'reading-wh-01',
    'writing-translation-01',
    'pronunciation-s-01',
    'communication-01',
    'mixed-hard-01'
  ];

  for (const key of representativeKeys) {
    const content = getG6U2TrapContent(key);
    for (const item of content.items) {
      assert.equal(item.theorySupport.access, 'anytime', item.id);
      assert.ok(item.teachingFeedback.theory.length <= 180, `${item.id} theory is too dense`);
      assert.ok(item.teachingFeedback.example.length <= 150, `${item.id} theory example is too dense`);
    }
  }

  const thereText = JSON.stringify(getG6U2TrapContent('grammar-there-01'));
  assert.match(thereText, /cụm danh từ/);
  assert.match(thereText, /There is dùng với một/);
  assert.match(thereText, /There are dùng với nhiều/);

  const suggestionText = JSON.stringify(getG6U2TrapContent('grammar-suggestion-01'));
  assert.match(suggestionText, /How about \+ V-ing/);
  assert.match(suggestionText, /Let’s \+ động từ nguyên mẫu/);

  const whText = JSON.stringify(getG6U2TrapContent('reading-wh-01'));
  assert.match(whText, /Who hỏi người/);
  assert.match(whText, /Where hỏi nơi/);
  assert.match(whText, /How many hỏi số lượng/);
});

test('there-is/are explanations follow the repaired form for all 12 items', () => {
  const thereLesson = getG6U2TrapContent('grammar-there-01');
  const byId = new Map(thereLesson.items.map(item => [item.id, item]));
  const expectedReasonByQuestion = Object.freeze({
    q01: 'Cụm sau there là số nhiều.',
    q02: 'Cụm sau there là số ít.',
    q03: 'Cụm sau there là số nhiều.',
    q04: 'Cụm sau there là số ít.',
    q05: 'Cụm sau there là số nhiều.',
    q06: 'Cụm sau there là số ít.',
    q07: 'Cụm sau there là số nhiều.',
    q08: 'Cụm sau there là số ít.',
    q09: 'Cụm sau there là số nhiều.',
    q10: 'Cụm sau there là số ít.',
    q11: 'Cụm sau there là số ít.',
    q12: 'Cụm sau there là số nhiều.'
  });

  for (const [question, expectedReason] of Object.entries(expectedReasonByQuestion)) {
    const id = `g6u2-trap-grammar-there-01-${question}`;
    assert.equal(byId.get(id)?.diagnosticSpec?.reason, expectedReason, id);
  }
});
