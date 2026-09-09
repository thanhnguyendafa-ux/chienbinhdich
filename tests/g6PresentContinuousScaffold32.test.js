import test from 'node:test';
import assert from 'node:assert/strict';
import { g6ReviewU13PcScaffold32Content } from '../src/data/g6-review-u1-3-pc-scaffold-32.js';
import { g6PcScaffold32Registry } from '../src/data/g6-review-u1-3-pc-scaffold-32-catalog.js';
import { lessonRegistry } from '../src/data/publishedLessonCatalog.js';

test('G6 Present Continuous scaffold keeps the approved 32-item progression and question mix', () => {
  const items = g6ReviewU13PcScaffold32Content.items;
  assert.equal(items.length, 32);
  assert.deepEqual(
    items.map(item => item.id),
    Array.from({ length: 32 }, (_, index) => `g6-pc-scaffold32-q${String(index + 1).padStart(2, '0')}`)
  );

  const counts = items.reduce((result, item) => {
    result[item.type] = (result[item.type] ?? 0) + 1;
    return result;
  }, {});
  assert.deepEqual(counts, { mcq: 14, typing: 17, sentence_order: 1 });
});

test('every scaffold item exposes answer plus explanation feedback', () => {
  for (const item of g6ReviewU13PcScaffold32Content.items) {
    assert.ok(item.teachingFeedback, `${item.id} is missing teachingFeedback`);
    for (const key of ['correctLabel', 'reason', 'theory', 'example']) {
      assert.ok(String(item.teachingFeedback[key] ?? '').trim(), `${item.id} is missing ${key}`);
    }
  }
});

test('exam-transfer tail preserves the approved answers and ordering contract', () => {
  const items = new Map(g6ReviewU13PcScaffold32Content.items.map(item => [item.id, item]));

  const q29 = items.get('g6-pc-scaffold32-q29');
  assert.equal(q29.choices.find(choice => choice.id === q29.correctChoiceId)?.text, 'are taking');

  assert.equal(items.get('g6-pc-scaffold32-q30').en, 'is reading');
  assert.deepEqual(items.get('g6-pc-scaffold32-q31').correctOrder, ['They', 'are', 'playing', 'badminton', 'now', '.']);
  assert.equal(items.get('g6-pc-scaffold32-q32').en, 'cycles / is walking');
  assert.equal(items.get('g6-pc-scaffold32-q32').typingSeparatorTolerance, true);
});

test('published descriptor places the 32-item set in the existing Present Continuous folder', async () => {
  assert.equal(g6PcScaffold32Registry.length, 1);
  const descriptor = g6PcScaffold32Registry[0];
  assert.equal(descriptor.id, 'g6-review-u1-3-pc-scaffold-32');
  assert.equal(descriptor.folderId, 'global6-review-u1-3-present-continuous');
  assert.equal(descriptor.order, 4);
  assert.equal(descriptor.itemCount, 32);
  assert.equal(descriptor.passThreshold, 80);
  assert.equal(descriptor.completionPolicy, 'all-items');
  assert.equal(descriptor.typingTolerance, true);
  assert.deepEqual(descriptor.activityTypes, ['mcq', 'typing', 'sentence_order']);
  assert.ok(lessonRegistry.some(set => set.id === descriptor.id));

  const loaded = await descriptor.loadContent();
  assert.equal(loaded.items.length, 32);
});
