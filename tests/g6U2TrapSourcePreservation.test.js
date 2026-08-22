import test from 'node:test';
import assert from 'node:assert/strict';
import { g6U2TrapSource } from '../src/data/g6-u2-trap-source.js';
import { getG6U2TrapContent } from '../src/data/g6-u2-trap-content.js';

test('Grade 4 presentation preserves Unit 2 source identity and evidence for all 238 items', () => {
  let total = 0;

  for (const lesson of g6U2TrapSource) {
    const presented = getG6U2TrapContent(lesson.key);
    assert.equal(presented.items.length, lesson.items.length, lesson.key);

    const presentedById = new Map(presented.items.map(item => [item.id, item]));
    for (const sourceItem of lesson.items) {
      const item = presentedById.get(sourceItem.id);
      assert.ok(item, `${lesson.key}/${sourceItem.id} missing after presentation`);
      assert.equal(item.id, sourceItem.id, sourceItem.id);
      assert.equal(item.trapCode, sourceItem.trapCode, sourceItem.id);
      assert.equal(item.sourceScope, sourceItem.sourceScope, sourceItem.id);
      assert.equal(item.sourceEvidence, sourceItem.sourceEvidence, sourceItem.id);
      assert.equal(item.exactCorpusRequired, sourceItem.exactCorpusRequired, sourceItem.id);
      total += 1;
    }
  }

  assert.equal(total, 238);
});
