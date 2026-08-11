import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import {
  g6ReviewU13SourceDimensions,
  g6ReviewU13MicroSkills,
  g6ReviewU13Traps,
  g6ReviewU13Phrases,
  g6ReviewU13ExerciseSeeds,
  g6ReviewU13MicroSkillIds,
  g6ReviewU13CoreMicroSkillIds,
  g6ReviewU13SupportMicroSkillIds,
  g6ReviewU13TrapIds,
  g6ReviewU13PhraseIds,
  g6ReviewU13ExerciseSeedIds
} from '../src/data/g6-review-u1-3-source.js';
import { g6ReviewU13Folders, g6ReviewU13Registry } from '../src/data/g6-review-u1-3-catalog.js';
import { getG6ReviewU13Content } from '../src/data/g6-review-u1-3-content.js';

test('G6 Unit 1–3 source bank locks the audited package dimensions', () => {
  assert.deepEqual(g6ReviewU13SourceDimensions, { microSkills: 34, traps: 26, phrases: 153, exerciseSeeds: 360 });
  assert.equal(g6ReviewU13MicroSkills.length, 34);
  assert.equal(g6ReviewU13CoreMicroSkillIds.length, 26);
  assert.equal(g6ReviewU13SupportMicroSkillIds.length, 8);
  assert.equal(g6ReviewU13Traps.length, 26);
  assert.ok(g6ReviewU13Phrases.length >= 20);
  assert.equal(g6ReviewU13ExerciseSeeds.length, 116);
});

test('G6 Unit Review publishes 23 approximately-20-minute Grammar Review lessons', () => {
  assert.equal(g6ReviewU13Folders.length, 13);
  assert.equal(g6ReviewU13Folders[0].id, 'global6-unit-review');
  assert.equal(g6ReviewU13Folders[0].parentId, 'global6');
  assert.equal(g6ReviewU13Registry.length, 23);
  assert.ok(g6ReviewU13Registry.every(lesson => lesson.itemCount === 12));
  assert.ok(g6ReviewU13Registry.every(lesson => lesson.expectedTimeMinutes >= 17 && lesson.expectedTimeMinutes <= 20));
  assert.ok(g6ReviewU13Registry.every(lesson => lesson.completionPolicy === 'all-items'));
  assert.ok(g6ReviewU13Registry.every(lesson => lesson.typingTolerance === false));

  const counts = new Map();
  for (const lesson of g6ReviewU13Registry) counts.set(lesson.folderId, (counts.get(lesson.folderId) ?? 0) + 1);
  assert.equal(counts.get('global6-review-u1-3-present-simple'), 3);
  assert.equal(counts.get('global6-review-u1-3-frequency'), 1);
  assert.equal(counts.get('global6-review-u1-3-possessive'), 1);
  assert.equal(counts.get('global6-review-u1-3-prepositions'), 2);
  assert.equal(counts.get('global6-review-u1-3-there-be'), 1);
  assert.equal(counts.get('global6-review-u1-3-description'), 1);
  assert.equal(counts.get('global6-review-u1-3-present-continuous'), 3);
  assert.equal(counts.get('global6-review-u1-3-simple-vs-continuous'), 2);
  assert.equal(counts.get('global6-review-u1-3-integrated'), 1);
  assert.equal(counts.get('global6-review-u1-3-mixed'), 8);
});

test('every G6 Review lesson validates, uses all five native interactions and carries mindset-first feedback', () => {
  for (const descriptor of g6ReviewU13Registry) {
    const key = descriptor.id.replace('g6-review-u1-3-', '');
    const content = getG6ReviewU13Content(key);
    assert.equal(content.items.length, 12);
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), []);

    const nativeTypes = new Set(content.items.map(item => item.type));
    assert.deepEqual([...nativeTypes].sort(), ['classification', 'mcq', 'sentence_order', 'true_false', 'typing']);

    for (const item of content.items) {
      assert.ok(item.teachingFeedback);
      assert.match(item.teachingFeedback.theory, /MINDSET FIRST/);
      assert.ok(item.teachingFeedback.reason.length > 0);
      assert.ok(item.teachingFeedback.example.length > 0);
      assert.ok(item.sourceScope.includes('Global Success 6 Unit 1–3 Master Bank'));
      assert.ok(Array.isArray(item.microSkillIds) && item.microSkillIds.length > 0);
      assert.ok(Array.isArray(item.trapIds));
      assert.ok(Array.isArray(item.phraseIds));
      assert.ok(Array.isArray(item.sourceExerciseIds));
    }
  }
});

test('all 34 micro-skills and all 26 trap mechanisms are covered, with CORE dominating SUPPORT', () => {
  const microTrace = [];
  const trapTrace = [];
  for (const descriptor of g6ReviewU13Registry) {
    const key = descriptor.id.replace('g6-review-u1-3-', '');
    for (const item of getG6ReviewU13Content(key).items) {
      microTrace.push(...item.microSkillIds);
      trapTrace.push(...item.trapIds);
    }
  }
  assert.deepEqual([...new Set(microTrace)].sort(), [...g6ReviewU13MicroSkillIds].sort());
  assert.deepEqual([...new Set(trapTrace)].sort(), [...g6ReviewU13TrapIds].sort());

  const core = new Set(g6ReviewU13CoreMicroSkillIds);
  const support = new Set(g6ReviewU13SupportMicroSkillIds);
  const coreRefs = microTrace.filter(id => core.has(id)).length;
  const supportRefs = microTrace.filter(id => support.has(id)).length;
  assert.ok(coreRefs > supportRefs * 2, `CORE should dominate SUPPORT: ${coreRefs} vs ${supportRefs}`);
});

test('source metadata references stay inside the locked Master Bank and at least 100 audited exercise seeds are reused', () => {
  const micro = new Set(g6ReviewU13MicroSkillIds);
  const traps = new Set(g6ReviewU13TrapIds);
  const phrases = new Set(g6ReviewU13PhraseIds);
  const seeds = new Set(g6ReviewU13ExerciseSeedIds);
  const usedSeeds = new Set();

  for (const descriptor of g6ReviewU13Registry) {
    const key = descriptor.id.replace('g6-review-u1-3-', '');
    for (const item of getG6ReviewU13Content(key).items) {
      assert.ok(item.microSkillIds.every(id => micro.has(id)), `${item.id} unknown micro-skill`);
      assert.ok(item.trapIds.every(id => traps.has(id)), `${item.id} unknown trap`);
      assert.ok(item.phraseIds.every(id => phrases.has(id)), `${item.id} unknown phrase`);
      assert.ok(item.sourceExerciseIds.every(id => seeds.has(id)), `${item.id} unknown source seed`);
      for (const id of item.sourceExerciseIds) usedSeeds.add(id);
      if (item.sourceExerciseIds.length === 0) assert.equal(item.authoredExtension, true, `${item.id} must mark authored extension`);
    }
  }
  assert.equal(usedSeeds.size, 116);
});

test('every Sentence Order is select-plus-order with mechanism-linked distractors', () => {
  for (const descriptor of g6ReviewU13Registry) {
    const key = descriptor.id.replace('g6-review-u1-3-', '');
    const orders = getG6ReviewU13Content(key).items.filter(item => item.type === 'sentence_order');
    assert.equal(orders.length, 1, `${descriptor.id} should have one focused reorder trap`);
    for (const item of orders) {
      assert.ok(item.tokens.length > item.correctOrder.length);
      assert.ok(item.orderDiagnostics?.distractors?.length >= 2);
      const acceptedTokens = new Set((item.acceptedOrders ?? [item.correctOrder]).flat());
      for (const distractor of item.orderDiagnostics.distractors) {
        assert.ok(item.tokens.includes(distractor.token));
        assert.equal(acceptedTokens.has(distractor.token), false);
        assert.ok(distractor.code);
        assert.ok(distractor.hint);
      }
    }
  }
});

test('Mixed Grammar Review hides target labels and mixes Unit 1, 2 and 3 in every lesson', () => {
  const mixed = g6ReviewU13Registry.filter(lesson => lesson.folderId === 'global6-review-u1-3-mixed');
  assert.equal(mixed.length, 8);
  for (const descriptor of mixed) {
    assert.match(descriptor.title, /^Mixed Grammar Traps/);
    const key = descriptor.id.replace('g6-review-u1-3-', '');
    const content = getG6ReviewU13Content(key);
    const units = new Set(content.items.flatMap(item => item.units));
    assert.deepEqual([...units].sort(), [1, 2, 3]);
    assert.ok(content.items.some(item => item.exerciseKind === 'error_correction'));
    assert.ok(content.items.some(item => item.exerciseKind === 'typing_translation' || item.exerciseKind === 'contextual_cloze' || item.exerciseKind === 'mixed_verb_form'));
  }
});
