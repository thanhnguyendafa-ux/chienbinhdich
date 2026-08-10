import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import {
  g5ReviewU15Grammar,
  g5ReviewU15Vocabulary,
  g5ReviewU15GrammarIds,
  g5ReviewU15VocabularyIds,
  g5ReviewU15CoreGrammarIds,
  g5ReviewU15RecurringGrammarIds
} from '../src/data/g5-review-u1-5-source.js';
import { g5ReviewU15Folders, g5ReviewU15Registry } from '../src/data/g5-review-u1-5-catalog.js';
import { getG5ReviewU15MixedContent } from '../src/data/g5-review-u1-5-content.js';

const REQUIRED_KINDS = Object.freeze([
  'mcq',
  'true_false',
  'grammar_cloze',
  'sentence_order',
  'classification',
  'error_correction',
  'transformation',
  'typing_translation',
  'vocabulary_context_cloze'
]);

test('Global 5 Review Unit 1–5 publishes exactly 10 Mixed Grammar Traps lessons', () => {
  assert.equal(g5ReviewU15Folders.length, 1);
  assert.equal(g5ReviewU15Folders[0].id, 'global5-review-u1-5');
  assert.equal(g5ReviewU15Folders[0].parentId, 'global5');
  assert.equal(g5ReviewU15Registry.length, 10);
  assert.deepEqual(g5ReviewU15Registry.map(lesson => lesson.expectedTimeMinutes), [16, 16, 17, 17, 18, 18, 19, 19, 20, 20]);
  assert.ok(g5ReviewU15Registry.every(lesson => lesson.itemCount === 12));
  assert.ok(g5ReviewU15Registry.every(lesson => lesson.completionPolicy === 'all-items'));
  assert.ok(g5ReviewU15Registry.every(lesson => lesson.typingTolerance === false));
});

test('every lesson is a real U1–U5 mixed lesson with all requested activity families', () => {
  for (const descriptor of g5ReviewU15Registry) {
    const content = getG5ReviewU15MixedContent(descriptor.id.slice(-2));
    assert.equal(content.items.length, 12);
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), []);

    const units = new Set(content.items.flatMap(item => item.units ?? []));
    assert.deepEqual([...units].sort(), [1, 2, 3, 4, 5], `${descriptor.id} must mix all five units`);

    const kinds = new Set(content.items.map(item => item.exerciseKind));
    for (const kind of REQUIRED_KINDS) assert.ok(kinds.has(kind), `${descriptor.id} missing ${kind}`);
    assert.equal(content.items.filter(item => item.exerciseKind === 'vocabulary_context_cloze').length, 4);

    const nativeTypes = new Set(content.items.map(item => item.type));
    assert.deepEqual([...nativeTypes].sort(), ['classification', 'mcq', 'sentence_order', 'true_false', 'typing']);

    for (const item of content.items) {
      assert.ok(item.teachingFeedback, `${item.id} missing teaching feedback`);
      assert.match(item.teachingFeedback.theory, /MINDSET FIRST/, `${item.id} feedback must be mindset-first`);
      assert.ok(Array.isArray(item.grammarIds));
      assert.ok(Array.isArray(item.vocabIds));
      assert.ok(Array.isArray(item.units) && item.units.length > 0);
    }
  }
});

test('every Sentence Order has real distractor options and diagnostics', () => {
  for (const descriptor of g5ReviewU15Registry) {
    const content = getG5ReviewU15MixedContent(descriptor.id.slice(-2));
    const orders = content.items.filter(item => item.type === 'sentence_order');
    assert.equal(orders.length, 1, `${descriptor.id} should have one focused reorder trap`);

    for (const item of orders) {
      assert.ok(item.tokens.length > item.correctOrder.length, `${item.id} must contain unused distractor tokens`);
      assert.ok(item.orderDiagnostics?.distractors?.length >= 2, `${item.id} needs at least two distractors`);
      const acceptedTokens = new Set((item.acceptedOrders ?? [item.correctOrder]).flat());
      for (const distractor of item.orderDiagnostics.distractors) {
        assert.ok(item.tokens.includes(distractor.token));
        assert.equal(acceptedTokens.has(distractor.token), false, `${item.id}/${distractor.token} cannot be part of an accepted answer`);
        assert.ok(distractor.code);
        assert.ok(distractor.hint);
      }
    }
  }
});

test('all 39 source vocabulary items are actively retrieved by no-hint context cloze', () => {
  assert.equal(g5ReviewU15Vocabulary.length, 39);
  const seen = new Set();

  for (const descriptor of g5ReviewU15Registry) {
    const content = getG5ReviewU15MixedContent(descriptor.id.slice(-2));
    for (const item of content.items.filter(item => item.exerciseKind === 'vocabulary_context_cloze')) {
      assert.match(item.vi, /______/);
      assert.equal(item.type, 'typing');
      assert.match(item.typingUi.instruction, /Không có word bank hoặc gợi ý/);
      assert.equal('choices' in item, false);
      assert.equal(item.vocabIds.length, 1);
      seen.add(item.vocabIds[0]);
    }
  }

  assert.deepEqual([...seen].sort(), [...g5ReviewU15VocabularyIds].sort());
});

test('all 48 grammar mechanisms are traceable and CORE receives more practice than RECURRING', () => {
  assert.equal(g5ReviewU15Grammar.length, 48);
  assert.equal(g5ReviewU15CoreGrammarIds.length, 32);
  assert.equal(g5ReviewU15RecurringGrammarIds.length, 16);

  const validIds = new Set(g5ReviewU15GrammarIds);
  const trace = [];
  for (const descriptor of g5ReviewU15Registry) {
    const content = getG5ReviewU15MixedContent(descriptor.id.slice(-2));
    for (const item of content.items) {
      for (const grammarId of item.grammarIds ?? []) {
        assert.ok(validIds.has(grammarId), `${item.id} references unknown grammar id ${grammarId}`);
        trace.push(grammarId);
      }
    }
  }

  assert.deepEqual([...new Set(trace)].sort(), [...g5ReviewU15GrammarIds].sort());
  const core = new Set(g5ReviewU15CoreGrammarIds);
  const recurring = new Set(g5ReviewU15RecurringGrammarIds);
  const coreReferences = trace.filter(id => core.has(id)).length;
  const recurringReferences = trace.filter(id => recurring.has(id)).length;
  assert.ok(coreReferences > recurringReferences * 2, `CORE should dominate: ${coreReferences} vs ${recurringReferences}`);
});

test('all vocabulary and grammar metadata references stay inside the locked U1–U5 dataset', () => {
  const grammarIds = new Set(g5ReviewU15GrammarIds);
  const vocabIds = new Set(g5ReviewU15VocabularyIds);

  for (const descriptor of g5ReviewU15Registry) {
    const content = getG5ReviewU15MixedContent(descriptor.id.slice(-2));
    for (const item of content.items) {
      assert.ok(item.grammarIds.every(id => grammarIds.has(id)), `${item.id} has grammar outside source scope`);
      assert.ok(item.vocabIds.every(id => vocabIds.has(id)), `${item.id} has vocab outside source scope`);
      assert.equal(item.sourceScope, 'Global Success 5 U1–U5 Grammar & Vocabulary Dataset');
    }
  }
});
