import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { mrtG6GanAuraAction01Content } from '../src/data/mrt-g6-gan-aura-action-01.js';
import { createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const SET_ID = 'mrt-g6-gan-aura-action-01';

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function correctResponse(item) {
  if (item.type === 'mcq') return item.correctChoiceId;
  if (item.type === 'true_false') return item.answer;
  throw new Error(`Unexpected question type in MRT Set: ${item.type}`);
}

test('MRT grammar classification content has the locked 20-question distribution', () => {
  const items = mrtG6GanAuraAction01Content.items;
  assert.equal(items.length, 20);
  assert.deepEqual(countBy(items.map(item => item.type)), { mcq: 10, true_false: 10 });
  assert.deepEqual(countBy(items.map(item => item.teachingFeedback.correctLabel)), {
    'Gán TO BE': 7,
    'Aura TO BE': 7,
    'Hành động VERB': 6
  });

  const trueFalseItems = items.filter(item => item.type === 'true_false');
  assert.equal(trueFalseItems.filter(item => item.answer === true).length, 5);
  assert.equal(trueFalseItems.filter(item => item.answer === false).length, 5);
  assert.deepEqual(new Set(items.map(item => item.sourceUnit)), new Set([
    'Unit 1 · My New School',
    'Unit 2 · My House',
    'Unit 3 · My Friends'
  ]));
});

test('all 20 MRT items carry complete learner-facing teaching feedback', () => {
  for (const item of mrtG6GanAuraAction01Content.items) {
    assert.ok(item.teachingFeedback);
    for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
      assert.equal(typeof item.teachingFeedback[field], 'string');
      assert.ok(item.teachingFeedback[field].trim().length > 0, `${item.id} missing ${field}`);
    }
    const prompt = item.type === 'true_false' ? item.statement : item.prompt;
    assert.match(prompt, /Cho câu:/);
  }
});

test('MRT MCQ answer identity is semantic rather than A/B/C position', () => {
  const expectedIds = ['action', 'aura', 'gan'];
  for (const item of mrtG6GanAuraAction01Content.items.filter(candidate => candidate.type === 'mcq')) {
    assert.deepEqual(item.choices.map(choice => choice.id).sort(), expectedIds);
    assert.ok(expectedIds.includes(item.correctChoiceId));
  }
});

test('MRT content graph is deeply immutable before and after repository caching', async () => {
  const sourceItem = mrtG6GanAuraAction01Content.items[0];
  const originalPrompt = sourceItem.prompt;
  const originalChoice = sourceItem.choices[0].text;

  assert.equal(Object.isFrozen(mrtG6GanAuraAction01Content), true);
  assert.equal(Object.isFrozen(mrtG6GanAuraAction01Content.items), true);
  assert.equal(Object.isFrozen(sourceItem), true);
  assert.equal(Object.isFrozen(sourceItem.choices), true);
  assert.equal(Object.isFrozen(sourceItem.choices[0]), true);
  assert.throws(() => { sourceItem.prompt = 'mutated'; }, TypeError);
  assert.throws(() => { sourceItem.choices[0].text = 'mutated'; }, TypeError);

  const cachedSet = await loadLessonSet(SET_ID);
  assert.equal(cachedSet.items[0].prompt, originalPrompt);
  assert.equal(cachedSet.items[0].choices[0].text, originalChoice);
  assert.equal(Object.isFrozen(cachedSet.items[0]), true);
  assert.equal(Object.isFrozen(cachedSet.items[0].choices[0]), true);
});

test('published MRT Set resolves through catalog with 80 percent threshold and validates', async () => {
  const set = await loadLessonSet(SET_ID);
  assert.equal(set.folderId, 'mrt-lessons');
  assert.equal(set.course, 'Global Success 6');
  assert.equal(set.unit, 'Units 1–3 · My New School · My House · My Friends');
  assert.equal(set.title, 'Bài tập Phân loại gán - aura - hành động');
  assert.equal(set.passThreshold, 80);
  assert.deepEqual(set.activityTypes, ['mcq', 'true_false']);
  assert.equal(set.items.length, 20);
  assert.deepEqual(validateSet(set), []);
});

test('20-item MRT Set qualifies immediately at exact 80 percent after 16 clean gains', async () => {
  const set = await loadLessonSet(SET_ID);
  let session = createSession({ studentName: 'Học sinh MRT', set, now: 1000 });

  for (let index = 0; index < 16; index += 1) {
    const item = set.items.find(candidate => candidate.id === session.currentItemId);
    const result = submitAnswer({
      session,
      set,
      response: correctResponse(item),
      now: 2000 + index
    });
    session = result.session;
    if (index < 15) assert.equal(session.status, 'active');
  }

  const metrics = getSessionMetrics(session, set, 3000);
  assert.equal(session.status, 'passed');
  assert.equal(metrics.mastery, 80);
  assert.equal(metrics.completedMainItems, 16);
  assert.equal(metrics.total, 20);
  assert.equal(session.currentItemId, 'mrt-g6-classify-q16');
  assert.equal(session.mainCursor, 16);
});

test('content validator rejects incomplete teaching feedback but keeps it optional for legacy items', () => {
  const baseSet = {
    id: 'feedback-validator',
    passThreshold: 80,
    items: [{
      id: 'q1',
      type: 'mcq',
      prompt: 'Choose.',
      choices: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
      correctChoiceId: 'a'
    }]
  };
  assert.deepEqual(validateSet(baseSet), []);

  const invalid = structuredClone(baseSet);
  invalid.items[0].teachingFeedback = { correctLabel: 'A', reason: '', theory: 'Rule', example: 'Example' };
  assert.ok(validateSet(invalid).some(error => error.includes('thiếu reason')));
});
