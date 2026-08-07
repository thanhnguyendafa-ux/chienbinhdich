import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { g7U1Translation01Content } from '../src/data/g7-u1-translation-01.js';
import { createSession, getSessionMetrics, submitAnswer } from '../src/core/sessionMachine.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';

const SET_ID = 'g7-u1-translation-01';

const CANONICAL = [
  'Do you enjoy collecting teddy bears?',
  'Yes, I do it every day.',
  'Yes, very much.',
  'What do you like doing in your free time?',
  'I usually have lunch at 12.',
  'I like building dollhouses.',
  'Do you like making models?',
  'No, I don’t. But my brother loves it.',
  'No, I make paper flowers every day.',
  'What does your brother like doing?',
  'He enjoys doing yoga a lot.',
  'He goes to school at 7 a.m.',
  'Does your sister cook with you?',
  'Yes, she loves singing.',
  'Yes, she and I cook together in the evening.'
];

function targetText(item) {
  return item.choices.find(choice => choice.id === item.correctChoiceId)?.text ?? '';
}

test('translation Set locks the 15-item all-MCQ blueprint', () => {
  const items = g7U1Translation01Content.items;
  assert.equal(items.length, 15);
  assert.ok(items.every(item => item.type === 'mcq'));
  assert.ok(items.every(item => item.skill === 'translation-discrimination'));
  assert.ok(items.every(item => item.choices.length === 4));
  assert.ok(items.every(item => item.correctChoiceId === 'target-translation'));
  assert.deepEqual(items.map(targetText), CANONICAL);
});

test('translation choices use semantic ids, are unique, and keep exactly one canonical target', () => {
  for (const item of g7U1Translation01Content.items) {
    assert.equal(new Set(item.choices.map(choice => choice.id)).size, 4);
    assert.equal(new Set(item.choices.map(choice => choice.text)).size, 4);
    assert.ok(item.choices.some(choice => choice.id === item.correctChoiceId));
    assert.equal(item.choices.filter(choice => choice.text === targetText(item)).length, 1);
    assert.ok(item.choices.every(choice => !['a', 'b', 'c', 'd'].includes(choice.id.toLowerCase())));
  }
});

test('all translation items carry complete learner-facing teaching feedback', () => {
  for (const item of g7U1Translation01Content.items) {
    assert.match(item.prompt, /^Cho câu:/);
    assert.ok(item.vi);
    assert.ok(item.teachingFeedback);
    for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
      assert.equal(typeof item.teachingFeedback[field], 'string');
      assert.ok(item.teachingFeedback[field].trim().length > 0, `${item.id} missing ${field}`);
    }
    assert.equal(item.teachingFeedback.correctLabel, targetText(item));
  }
});

test('high-value plausible translation traps stay locked', () => {
  const byId = new Map(g7U1Translation01Content.items.map(item => [item.id, item]));
  const q13 = byId.get('g7-u1-translation-q13');
  assert.ok(q13.choices.some(choice => choice.text === 'Does your sister cook with you?'));
  assert.ok(q13.choices.some(choice => choice.text === 'Does your sister cook for you?'));

  const q5 = byId.get('g7-u1-translation-q05');
  assert.ok(q5.choices.some(choice => choice.text === 'I usually have lunch at 12.'));
  assert.ok(q5.choices.some(choice => choice.text === 'I always have lunch at 12.'));

  const q15 = byId.get('g7-u1-translation-q15');
  assert.ok(q15.choices.some(choice => choice.text === 'Yes, she and I cook together in the evening.'));
  assert.ok(q15.choices.some(choice => choice.text === 'Yes, she cooks for me in the evening.'));
});

test('translation content graph is deeply immutable', () => {
  const first = g7U1Translation01Content.items[0];
  assert.equal(Object.isFrozen(g7U1Translation01Content), true);
  assert.equal(Object.isFrozen(g7U1Translation01Content.items), true);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.choices), true);
  assert.equal(Object.isFrozen(first.choices[0]), true);
  assert.equal(Object.isFrozen(first.teachingFeedback), true);
  assert.throws(() => { first.prompt = 'mutated'; }, TypeError);
  assert.throws(() => { first.choices[0].text = 'mutated'; }, TypeError);
});

test('published translation Set resolves in Global 7 Unit 1 folder and validates', async () => {
  const set = await loadLessonSet(SET_ID);
  assert.equal(set.folderId, 'global7-unit1');
  assert.equal(set.course, 'Global Success 7');
  assert.equal(set.unit, 'Unit 1 · Hobbies');
  assert.equal(set.title, 'Bài tập dịch 1');
  assert.equal(set.passThreshold, 80);
  assert.deepEqual(set.activityTypes, ['mcq']);
  assert.equal(set.items.length, 15);
  assert.deepEqual(validateSet(set), []);
});

test('15-item translation Set qualifies immediately at exact 80 percent after 12 clean gains', async () => {
  const set = await loadLessonSet(SET_ID);
  let session = createSession({ studentName: 'Học sinh dịch', set, now: 1000 });

  for (let index = 0; index < 12; index += 1) {
    const item = set.items.find(candidate => candidate.id === session.currentItemId);
    const result = submitAnswer({
      session,
      set,
      response: item.correctChoiceId,
      now: 2000 + index
    });
    session = result.session;
    if (index < 11) assert.equal(session.status, 'active');
  }

  const metrics = getSessionMetrics(session, set, 3000);
  assert.equal(session.status, 'passed');
  assert.equal(metrics.masteryExact, 80);
  assert.equal(metrics.completedMainItems, 12);
  assert.equal(metrics.total, 15);
  assert.equal(session.currentItemId, 'g7-u1-translation-q12');
  assert.equal(session.mainCursor, 12);
});
