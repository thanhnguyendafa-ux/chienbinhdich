import test from 'node:test';
import assert from 'node:assert/strict';
import { expectedResponseDisplay } from '../src/core/questionTypes.js';
import { validateSet } from '../src/data/contentValidator.js';
import {
  g7ReviewU13SourceDimensions,
  g7ReviewU13MicroSkills,
  g7ReviewU13Traps,
  g7ReviewU13Phrases,
  g7ReviewU13ExerciseSeeds,
  g7ReviewU13MicroSkillIds,
  g7ReviewU13CoreMicroSkillIds,
  g7ReviewU13SupportMicroSkillIds,
  g7ReviewU13TrapIds,
  g7ReviewU13PhraseIds,
  g7ReviewU13ExerciseSeedIds
} from '../src/data/g7-review-u1-3-source.js';
import { g7ReviewU13Folders, g7ReviewU13Registry } from '../src/data/g7-review-u1-3-catalog.js';
import { getG7ReviewU13Content } from '../src/data/g7-review-u1-3-content.js';

test('G7 U1–3 source layer locks the uploaded Knowledge Bank dimensions', () => {
  assert.deepEqual(g7ReviewU13SourceDimensions, {
    webPages: 100, curatedVocabulary: 108, phraseChunks: 46, exerciseSeeds: 245, trapTypes: 35
  });
  assert.equal(g7ReviewU13MicroSkills.length, 21);
  assert.equal(g7ReviewU13CoreMicroSkillIds.length, 19);
  assert.equal(g7ReviewU13SupportMicroSkillIds.length, 2);
  assert.equal(g7ReviewU13Traps.length, 35);
  assert.equal(g7ReviewU13Phrases.length, 46);
  assert.equal(g7ReviewU13ExerciseSeeds.length, 213);
});

test('G7 Unit Review publishes 20 lessons under four grammar families', () => {
  assert.equal(g7ReviewU13Folders.length, 7);
  assert.equal(g7ReviewU13Folders[0].id, 'global7-unit-review');
  assert.equal(g7ReviewU13Folders[0].parentId, 'global7');
  assert.equal(g7ReviewU13Registry.length, 20);
  assert.ok(g7ReviewU13Registry.every(lesson => lesson.itemCount === 12));
  assert.ok(g7ReviewU13Registry.every(lesson => lesson.expectedTimeMinutes >= 18 && lesson.expectedTimeMinutes <= 20));
  assert.ok(g7ReviewU13Registry.every(lesson => lesson.completionPolicy === 'all-items'));
  assert.ok(g7ReviewU13Registry.every(lesson => lesson.typingTolerance === false));

  const counts = new Map();
  for (const lesson of g7ReviewU13Registry) counts.set(lesson.folderId, (counts.get(lesson.folderId) ?? 0) + 1);
  assert.equal(counts.get('global7-review-u1-3-present-simple'), 4);
  assert.equal(counts.get('global7-review-u1-3-simple-sentences'), 4);
  assert.equal(counts.get('global7-review-u1-3-past-simple'), 4);
  assert.equal(counts.get('global7-review-u1-3-mixed'), 8);
});

test('every G7 Review lesson validates, uses all five native interactions, and explains with Mr Thanh Brain Grammar', () => {
  for (const descriptor of g7ReviewU13Registry) {
    const key = descriptor.id.replace('g7-review-u1-3-', '');
    const content = getG7ReviewU13Content(key);
    assert.equal(content.items.length, 12);
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), []);

    const types = new Set(content.items.map(item => item.type));
    assert.deepEqual([...types].sort(), ['classification', 'mcq', 'sentence_order', 'true_false', 'typing']);

    for (const item of content.items) {
      assert.ok(item.teachingFeedback);
      assert.match(item.teachingFeedback.theory, /^MINDSET FIRST/);
      assert.ok(item.teachingFeedback.reason.length > 0);
      assert.ok(item.teachingFeedback.example.length > 0);
      assert.ok(Array.isArray(item.microSkillIds) && item.microSkillIds.length > 0);
      assert.ok(Array.isArray(item.trapIds));
      assert.ok(Array.isArray(item.phraseIds));
      assert.ok(Array.isArray(item.sourceExerciseIds));
      assert.equal(item.sourceScope, 'Global Success 7 U1–U3 Knowledge Bank · 100-webpage audit');
    }
  }
});

test('all 21 normalized micro-skills and all 35 source trap types are exercised', () => {
  const microTrace = [];
  const trapTrace = [];
  const seedTrace = [];
  for (const descriptor of g7ReviewU13Registry) {
    const key = descriptor.id.replace('g7-review-u1-3-', '');
    for (const item of getG7ReviewU13Content(key).items) {
      microTrace.push(...item.microSkillIds);
      trapTrace.push(...item.trapIds);
      seedTrace.push(...item.sourceExerciseIds);
    }
  }
  assert.deepEqual([...new Set(microTrace)].sort(), [...g7ReviewU13MicroSkillIds].sort());
  assert.deepEqual([...new Set(trapTrace)].sort(), [...g7ReviewU13TrapIds].sort());

  const usedSeeds = new Set(seedTrace);
  assert.equal(usedSeeds.size, 195);
  assert.ok([...usedSeeds].every(id => g7ReviewU13ExerciseSeedIds.includes(id)));

  const core = new Set(g7ReviewU13CoreMicroSkillIds);
  const support = new Set(g7ReviewU13SupportMicroSkillIds);
  const coreRefs = microTrace.filter(id => core.has(id)).length;
  const supportRefs = microTrace.filter(id => support.has(id)).length;
  assert.ok(coreRefs > supportRefs * 5, `CORE should dominate SUPPORT: ${coreRefs} vs ${supportRefs}`);
});

test('source IDs, trap IDs and phrase IDs never escape the locked source layer', () => {
  const micro = new Set(g7ReviewU13MicroSkillIds);
  const traps = new Set(g7ReviewU13TrapIds);
  const phrases = new Set(g7ReviewU13PhraseIds);
  const seeds = new Set(g7ReviewU13ExerciseSeedIds);

  for (const descriptor of g7ReviewU13Registry) {
    const key = descriptor.id.replace('g7-review-u1-3-', '');
    for (const item of getG7ReviewU13Content(key).items) {
      assert.ok(item.microSkillIds.every(id => micro.has(id)), `${item.id} unknown micro-skill`);
      assert.ok(item.trapIds.every(id => traps.has(id)), `${item.id} unknown trap`);
      assert.ok(item.phraseIds.every(id => phrases.has(id)), `${item.id} unknown phrase`);
      assert.ok(item.sourceExerciseIds.every(id => seeds.has(id)), `${item.id} unknown source seed`);
      if (item.sourceExerciseIds.length === 0) assert.equal(item.authoredExtension, true, `${item.id} should declare authoredExtension`);
    }
  }
});

test('every Sentence Order is Select + Order with mechanism diagnostics', () => {
  for (const descriptor of g7ReviewU13Registry) {
    const key = descriptor.id.replace('g7-review-u1-3-', '');
    const orders = getG7ReviewU13Content(key).items.filter(item => item.type === 'sentence_order');
    assert.ok(orders.length >= 1, `${descriptor.id} should contain sentence_order`);
    for (const item of orders) {
      assert.ok(item.tokens.length > item.correctOrder.length, `${item.id} needs unused distractor tokens`);
      assert.ok(item.orderDiagnostics?.distractors?.length >= 2, `${item.id} needs >=2 mechanism distractors`);
      const accepted = new Set((item.acceptedOrders ?? [item.correctOrder]).flat().map(String));
      for (const distractor of item.orderDiagnostics.distractors) {
        assert.ok(item.tokens.map(String).includes(String(distractor.token)));
        assert.equal(accepted.has(String(distractor.token)), false);
        assert.ok(distractor.code);
        assert.ok(distractor.hint);
      }
    }
  }
});

test('Unit 2 explanations enforce Subject | whole Predicate and clause-count thinking', () => {
  const u2 = g7ReviewU13Registry.filter(item => item.folderId === 'global7-review-u1-3-simple-sentences');
  assert.equal(u2.length, 4);
  for (const descriptor of u2) {
    const key = descriptor.id.replace('g7-review-u1-3-', '');
    const content = getG7ReviewU13Content(key);
    assert.ok(content.items.some(item => /QUÉT CẤU TRÚC/.test(item.teachingFeedback.theory)));
    assert.ok(content.items.some(item => /whole Predicate/.test(item.teachingFeedback.theory)));
  }
  const clauseLesson = getG7ReviewU13Content('ss-03');
  assert.ok(clauseLesson.items.some(item => /không đếm lexical verbs|KHÔNG đếm lexical verbs/i.test(item.teachingFeedback.theory)));
});

test('correct answers obey no-double-marking contracts for DOES and DID', () => {
  const badDoes = /\bDoes\b[^?!.]*\b(?:collects|makes|plays|rides|goes|likes|builds)\b/i;
  const badDid = /\bDid\b[^?!.]*\b(?:cleaned|donated|planted|picked|gave|made|taught|grew|came|bought)\b/i;
  for (const descriptor of g7ReviewU13Registry) {
    const key = descriptor.id.replace('g7-review-u1-3-', '');
    for (const item of getG7ReviewU13Content(key).items) {
      const answer = expectedResponseDisplay(item);
      assert.equal(badDoes.test(answer), false, `${item.id} double-marks DOES: ${answer}`);
      assert.equal(badDid.test(answer), false, `${item.id} double-marks DID: ${answer}`);
    }
  }
});

test('Mixed Grammar Review hides unit labels and forces U1/U2/U3 system switching', () => {
  const mixed = g7ReviewU13Registry.filter(item => item.folderId === 'global7-review-u1-3-mixed');
  assert.equal(mixed.length, 8);
  for (const descriptor of mixed) {
    assert.match(descriptor.title, /^Mixed Grammar Traps/);
    assert.doesNotMatch(descriptor.title, /Present Simple|Simple Sentences|Past Simple/);
    const key = descriptor.id.replace('g7-review-u1-3-', '');
    const content = getG7ReviewU13Content(key);
    const units = new Set(content.items.flatMap(item => item.units));
    assert.deepEqual([...units].sort(), [1, 2, 3]);
    assert.ok(content.items.some(item => item.sourceExerciseIds.some(id => id.startsWith('GS7-MIX-'))));
    assert.ok(content.items.some(item => item.exerciseKind === 'error_correction'));
    assert.ok(content.items.some(item => item.exerciseKind === 'typing_translation' || item.exerciseKind === 'transformation'));
    assert.ok(content.items.some(item => item.type === 'classification'));
  }
});
