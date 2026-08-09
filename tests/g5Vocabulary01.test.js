import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSet } from '../src/data/contentValidator.js';
import { createSession, submitAnswer } from '../src/core/sessionMachine.js';
import { getSetDescriptorBySlug, loadLessonSet } from '../src/repositories/lessonRepository.js';

function correctResponse(item) {
  if (item.type === 'mcq') return item.correctChoiceId;
  if (item.type === 'true_false') return item.answer;
  throw new Error(`Unsupported test item type: ${item.type}`);
}

test('Global Success 5 Unit 1 vocabulary lesson publishes the approved 17-item mix with Vietnamese feedback', async () => {
  const descriptor = getSetDescriptorBySlug('g5u1-tu-vung-1');
  assert.ok(descriptor);
  assert.equal(descriptor.id, 'g5-u1-vocab-01');
  assert.equal(descriptor.folderId, 'global5-unit1');
  assert.equal(descriptor.course, 'Global Success 5');
  assert.equal(descriptor.unit, 'Unit 1 · All about me!');
  assert.equal(descriptor.title, 'Bài tập từ vựng 1');
  assert.equal(descriptor.passThreshold, 80);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.equal(descriptor.itemCount, 17);
  assert.deepEqual(descriptor.activityTypes, ['mcq', 'true_false']);

  const set = await loadLessonSet(descriptor.id);
  assert.deepEqual(validateSet(set), []);
  assert.equal(set.items.length, 17);
  assert.equal(set.items.filter(item => item.type === 'mcq').length, 12);
  assert.equal(set.items.filter(item => item.type === 'true_false').length, 5);

  for (const item of set.items) {
    assert.ok(item.teachingFeedback, `${item.id} must have Vietnamese teaching feedback`);
    for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
      assert.ok(String(item.teachingFeedback[field] ?? '').trim(), `${item.id} missing ${field}`);
    }
    if (item.type === 'mcq') {
      assert.equal(item.choices.length, 3, `${item.id} must have exactly three choices`);
      assert.ok(item.choices.some(choice => choice.id === item.correctChoiceId));
    }
  }
});

test('all-items policy prevents early PASS at 80% and allows PASS after all 17 main items', async () => {
  const set = await loadLessonSet('g5-u1-vocab-01');
  let session = createSession({ studentName: 'Test Student', set, now: 1_000 });

  for (let index = 0; index < 14; index += 1) {
    const item = set.items.find(candidate => candidate.id === session.currentItemId);
    const result = submitAnswer({
      session,
      set,
      response: correctResponse(item),
      attemptMeta: { startedAt: 2_000 + index * 10, submittedAt: 2_005 + index * 10 },
      now: 2_005 + index * 10
    });
    session = result.session;
  }

  assert.equal(session.status, 'active');
  assert.equal(session.currentItemId, set.items[14].id);
  assert.ok(session.attempts.filter(attempt => attempt.masteryDeltaUnits === 1).length >= 14);

  for (let index = 14; index < 17; index += 1) {
    const item = set.items.find(candidate => candidate.id === session.currentItemId);
    const result = submitAnswer({
      session,
      set,
      response: correctResponse(item),
      attemptMeta: { startedAt: 3_000 + index * 10, submittedAt: 3_005 + index * 10 },
      now: 3_005 + index * 10
    });
    session = result.session;
  }

  assert.equal(session.status, 'passed');
  assert.ok(session.qualifiedAt);
  assert.equal(session.currentItemId, set.items[16].id);
});

test('Sets without all-items policy preserve the existing early qualification behavior', () => {
  const items = Array.from({ length: 5 }, (_, index) => ({
    id: `standard-${index + 1}`,
    type: 'mcq',
    prompt: `Question ${index + 1}`,
    choices: [
      { id: 'a', text: 'Correct' },
      { id: 'b', text: 'Wrong' }
    ],
    correctChoiceId: 'a'
  }));
  const set = { id: 'standard', version: 1, passThreshold: 80, items };
  let session = createSession({ studentName: 'Legacy Student', set, now: 10_000 });

  for (let index = 0; index < 4; index += 1) {
    const result = submitAnswer({
      session,
      set,
      response: 'a',
      attemptMeta: { startedAt: 11_000 + index * 10, submittedAt: 11_005 + index * 10 },
      now: 11_005 + index * 10
    });
    session = result.session;
  }

  assert.equal(session.status, 'passed');
  assert.equal(session.currentItemId, items[3].id);
});
