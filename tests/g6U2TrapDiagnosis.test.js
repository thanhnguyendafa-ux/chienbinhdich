import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g6U2TrapSource } from '../src/data/g6-u2-trap-source.js';
import { getG6U2TrapContent } from '../src/data/g6-u2-trap-content.js';
import { g6U2TrapFolders, g6U2TrapRegistry } from '../src/data/g6-u2-trap-catalog.js';
import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

const EXPECTED_CHOICE_IDS = Object.freeze([
  'context-swap',
  'correct',
  'keep-wrong',
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

test('GS6 Unit 2 Trap Diagnosis publishes 21 lessons / 238 six-choice MCQ items', async () => {
  assert.equal(g6U2TrapSource.length, 21);
  assert.equal(g6U2TrapRegistry.length, 21);
  assert.equal(g6U2TrapRegistry.reduce((sum, entry) => sum + entry.itemCount, 0), 238);

  const publishedTrapRegistry = lessonRegistry.filter(entry => entry.id.startsWith('g6-u2-trap-'));
  assert.equal(publishedTrapRegistry.length, 21);

  const publishedFolderIds = new Set(lessonFolders.map(folder => folder.id));
  for (const folder of g6U2TrapFolders) assert.ok(publishedFolderIds.has(folder.id), folder.id);

  for (const descriptor of g6U2TrapRegistry) {
    const resolved = getSetDescriptorBySlug(descriptor.lessonSlug);
    assert.ok(resolved, descriptor.lessonSlug);
    assert.equal(resolved.id, descriptor.id);
    assert.equal(resolved.activityTypes.length, 1);
    assert.equal(resolved.activityTypes[0], 'mcq');

    const set = await loadLessonSet(descriptor.id);
    assert.deepEqual(validateSet(set), [], descriptor.id);
    assert.equal(set.items.length, descriptor.itemCount);
  }
});

test('every Trap Diagnosis item uses six complete Error → Repair → Reason packages', () => {
  let totalItems = 0;

  for (const lesson of g6U2TrapSource) {
    const content = getG6U2TrapContent(lesson.key);
    totalItems += content.items.length;

    for (const item of content.items) {
      assert.equal(item.type, 'mcq', item.id);
      assert.equal(item.correctChoiceId, 'correct', item.id);
      assert.equal(item.choices.length, 6, item.id);
      assert.equal(item.theorySupport?.access, 'after_submit', item.id);
      assert.equal(typeof item.exactCorpusRequired, 'boolean', item.id);
      assert.equal(item.passageId, undefined, `${item.id} must not use 4-choice passageId reading mode`);

      const ids = item.choices.map(choice => choice.id).sort();
      assert.deepEqual(ids, EXPECTED_CHOICE_IDS, item.id);
      assert.equal(new Set(item.choices.map(choice => choice.text)).size, 6, `${item.id} duplicate choice text`);

      for (const choice of item.choices) {
        assert.match(choice.text, /^Sai ở: .+ → Sửa: .+ → Vì: .+$/s, `${item.id}/${choice.id}`);
        assert.ok(choice.feedback?.trim(), `${item.id}/${choice.id} missing feedback`);
        assert.ok(choice.diagnostic?.error?.trim(), `${item.id}/${choice.id} missing diagnostic error`);
        assert.ok(choice.diagnostic?.repair?.trim(), `${item.id}/${choice.id} missing diagnostic repair`);
        assert.ok(choice.diagnostic?.reason?.trim(), `${item.id}/${choice.id} missing diagnostic reason`);
      }

      const correct = item.choices.find(choice => choice.id === 'correct');
      assert.deepEqual(correct?.diagnostic, item.diagnosticSpec, `${item.id} correct diagnostic mismatch`);

      const sameRepairCount = item.choices.filter(choice => choice.diagnostic.repair === correct.diagnostic.repair).length;
      assert.ok(sameRepairCount >= 3, `${item.id} must include same-repair/different-reason traps`);

      for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
        assert.ok(item.teachingFeedback?.[field]?.trim(), `${item.id} missing teachingFeedback.${field}`);
      }

      if (String(item.trapCode).startsWith('R-')) {
        assert.ok(item.stimulus?.text?.trim(), `${item.id} Reading trap must include stimulus evidence`);
      }

      assert.doesNotMatch(learnerText(item), /\bNP\b|noun phrase/i, `${item.id} must use “cụm danh từ”, not NP/noun phrase`);
    }
  }

  assert.equal(totalItems, 238);
});

test('there-is/are learner theory uses “cụm danh từ” terminology', () => {
  const thereLesson = getG6U2TrapContent('grammar-there-01');
  const text = JSON.stringify(thereLesson);
  assert.match(text, /cụm danh từ/);
  assert.doesNotMatch(text, /\bNP\b|noun phrase/i);
  assert.doesNotMatch(text, /a chair and a bookshelf[^\n]{0,120}(số ít|singular)/i);
});
