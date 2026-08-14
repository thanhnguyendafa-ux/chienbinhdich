import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQuestion } from '../src/core/questionTypes.js';
import { validateSet } from '../src/data/contentValidator.js';
import { gs23WritingUnits } from '../src/data/gs23-writing-source.js';
import { gs23WritingPlans, getGs23WritingLesson } from '../src/data/gs23-writing-typing-builder.js';
import { gs23WritingFolders, gs23WritingRegistry, g2WritingRegistry, g3WritingRegistry } from '../src/data/gs23-writing-typing-catalog.js';

function normalized(value) {
  return String(value ?? '').toLocaleLowerCase('en');
}

test('GS2/GS3 Writing Typing publishes all 36 units as 15-minute micro-lessons', () => {
  assert.equal(Object.keys(gs23WritingUnits).length, 36);
  assert.equal(Object.keys(gs23WritingUnits).filter(id => id.startsWith('G2')).length, 16);
  assert.equal(Object.keys(gs23WritingUnits).filter(id => id.startsWith('G3')).length, 20);
  assert.equal(g2WritingRegistry.length, 48);
  assert.equal(g3WritingRegistry.length, 88);
  assert.equal(gs23WritingRegistry.length, 136);
  assert.equal(gs23WritingFolders.length, 39);
  assert.ok(gs23WritingRegistry.every(lesson => lesson.expectedTimeMinutes === 15));
  assert.ok(gs23WritingRegistry.every(lesson => lesson.typingTolerance === true));
  assert.ok(gs23WritingRegistry.every(lesson => lesson.completionPolicy === 'all-items'));
});

test('each micro-lesson has one or two typed canonical sentence targets and valid WORD → PHRASE → SENTENCE order', () => {
  for (const descriptor of gs23WritingRegistry) {
    assert.ok(descriptor.typedSourceSentenceIds.length >= 1 && descriptor.typedSourceSentenceIds.length <= 2, descriptor.id);
    const unitId = descriptor.typedSourceSentenceIds[0].split('-W')[0];
    const number = Number(descriptor.id.match(/-(\d{2})$/)?.[1]);
    const content = getGs23WritingLesson(unitId, number);
    assert.equal(content.items.length, descriptor.itemCount, `${descriptor.id} itemCount`);
    assert.deepEqual(validateSet({ ...descriptor, items: content.items }), [], descriptor.id);
    const stages = content.items.map(item => item.stage);
    assert.deepEqual(stages, [...stages].sort((a, b) => ({ word: 0, phrase: 1, sentence: 2 })[a] - ({ word: 0, phrase: 1, sentence: 2 })[b]), descriptor.id);
    assert.equal(content.items.filter(item => item.stage === 'sentence').length, descriptor.typedSourceSentenceIds.length, descriptor.id);
  }
});

test('canonical source coverage is complete while REUSE rows are not forced to type again', () => {
  for (const [unitId, unit] of Object.entries(gs23WritingUnits)) {
    const descriptors = gs23WritingRegistry.filter(entry => entry.typedSourceSentenceIds.some(id => id.startsWith(`${unitId}-`)) || entry.reusedSourceSentenceIds.some(id => id.startsWith(`${unitId}-`)));
    const covered = new Set(descriptors.flatMap(entry => entry.sourceSentenceIds));
    assert.deepEqual([...covered].sort(), unit.rows.map(row => row.id).sort(), unitId);
    const reused = new Set(descriptors.flatMap(entry => entry.reusedSourceSentenceIds));
    for (const row of unit.rows.filter(row => row.mode === 'reuse')) assert.ok(reused.has(row.id), row.id);
    for (const descriptor of descriptors) {
      const number = Number(descriptor.id.match(/-(\d{2})$/)?.[1]);
      const content = getGs23WritingLesson(unitId, number);
      const typedSourceIds = new Set(content.items.filter(item => item.stage === 'sentence').map(item => item.sourceSentenceId));
      for (const id of descriptor.reusedSourceSentenceIds) assert.equal(typedSourceIds.has(id), false, `${descriptor.id}/${id}`);
    }
  }
});

test('WORD and PHRASE scaffolds keep exact surface forms inside downstream target sentences', () => {
  for (const [unitId, plans] of Object.entries(gs23WritingPlans)) {
    for (const spec of plans) {
      const content = getGs23WritingLesson(unitId, spec.lessonNumber);
      const sentenceText = content.items.filter(item => item.stage === 'sentence').map(item => normalized(item.en)).join(' ');
      for (const item of content.items.filter(item => item.stage === 'word' || item.stage === 'phrase')) {
        assert.ok(sentenceText.includes(normalized(item.en)), `${unitId}/${spec.lessonNumber}: ${item.en}`);
      }
    }
  }
});

test('PAIR short answers always carry their Vietnamese parent context', () => {
  for (const [unitId, unit] of Object.entries(gs23WritingUnits)) {
    const expected = unit.rows.filter(row => row.mode === 'pair');
    for (const row of expected) {
      const plan = gs23WritingPlans[unitId].find(spec => spec.typedSourceSentenceIds.includes(row.id));
      const content = getGs23WritingLesson(unitId, plan.lessonNumber);
      const item = content.items.find(candidate => candidate.sourceSentenceId === row.id);
      const parent = unit.rows.find(candidate => candidate.id === row.contextSourceId);
      assert.equal(item.contextVi, parent.vi, row.id);
    }
  }
});

test('young learner tolerance accepts missing case, sentence punctuation, apostrophes and hyphens but not grammar substitutions', () => {
  const item = { id: 'young', vi: 'Tớ đang chơi trốn tìm.', en: "I'm playing hide-and-seek." };
  assert.equal(evaluateQuestion(item, 'im playing hide and seek', { typingTolerance: true }).correct, true);
  assert.equal(evaluateQuestion(item, 'i am playing hide and seek', { typingTolerance: true }).correct, true);
  assert.equal(evaluateQuestion(item, 'they are playing hide and seek', { typingTolerance: true }).correct, false);
  const name = { id: 'name', vi: 'Tên mình là Ben.', en: "My name's Ben." };
  assert.equal(evaluateQuestion(name, 'my name is ben', { typingTolerance: true }).correct, true);
});

test('young learner scaffold overrides remove known misleading draft cues', () => {
  assert.deepEqual(gs23WritingUnits.G2U16.rows.find(row => row.id === 'G2U16-W07').phrases, [['gần bàn', 'near the table']]);
  assert.deepEqual(gs23WritingUnits.G3U02.rows.find(row => row.id === 'G3U02-W02').words, [['tên', 'name']]);
  assert.deepEqual(gs23WritingUnits.G3U16.rows.find(row => row.id === 'G3U16-W05').phrases, [['bao nhiêu con chó', 'how many dogs']]);
});

test('lesson ids and slugs are globally unique inside the new program', () => {
  assert.equal(new Set(gs23WritingRegistry.map(entry => entry.id)).size, gs23WritingRegistry.length);
  assert.equal(new Set(gs23WritingRegistry.map(entry => entry.lessonSlug)).size, gs23WritingRegistry.length);
});
