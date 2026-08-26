import test from 'node:test';
import assert from 'node:assert/strict';

import { lessonFolders, lessonRegistry } from '../src/data/publishedLessonCatalog.js';
import { validateCatalog } from '../src/data/catalogValidator.js';
import { validateSet } from '../src/data/contentValidator.js';
import { g6WorkbookRemainingSourceManifest } from '../src/data/workbooks/g6/index.js';
import { G6_TAP2_EXPECTED_ATOM_COUNT, G6_TAP2_INTERACTION_POLICY, g6Tap2ExpectedLessonIds, g6Tap2Ssot } from '../src/data/workbooks/g6/tap2-ssot.js';

const wordCount = value => String(value ?? '').trim().split(/\s+/).filter(Boolean).length;
const isLongScoredTyping = item => item?.type === 'typing'
  && item?.assessmentMode !== 'unscored'
  && item?.responseMode !== 'open'
  && wordCount(item?.en) >= G6_TAP2_INTERACTION_POLICY.longTypingMinWords;

function manifestId(row) {
  if (row?.id) return row.id;
  return `g6-u${String(row.unit).padStart(2, '0')}-wb-${row.key}`;
}

test('G6 Tập Hai SSOT contains 120 audited atoms / 119 numbered exercises', () => {
  assert.equal(G6_TAP2_EXPECTED_ATOM_COUNT, 120);
  assert.equal(g6Tap2Ssot.length, 120);
  assert.equal(new Set(g6Tap2ExpectedLessonIds).size, 120);
});

test('every G6 Tập Hai SSOT atom is published as a Sách bài tập lesson', () => {
  const byId = new Map(lessonRegistry.map(entry => [entry.id, entry]));
  const folderById = new Map(lessonFolders.map(folder => [folder.id, folder]));
  const missing = g6Tap2ExpectedLessonIds.filter(id => !byId.has(id));
  assert.deepEqual(missing, []);

  for (const id of g6Tap2ExpectedLessonIds) {
    const entry = byId.get(id);
    assert.match(entry.unit, /Sách bài tập/);
    const folder = folderById.get(entry.folderId);
    assert.ok(folder, `missing folder for ${id}`);
    assert.match(folder.name, /Sách bài tập/);
  }
});

test('aggregate source manifest has no omitted G6 Tập Hai SSOT atom', () => {
  const expected = new Set(g6Tap2ExpectedLessonIds);
  const rows = g6WorkbookRemainingSourceManifest.filter(row => expected.has(manifestId(row)));
  assert.equal(rows.length, 120);
  const missing = g6Tap2ExpectedLessonIds.filter(id => !rows.some(row => manifestId(row) === id));
  assert.deepEqual(missing, []);
  const omitted = rows.filter(row => row.status === 'omitted');
  assert.deepEqual(omitted, []);
});

test('published catalog remains valid after G6 Tập Hai supplements', () => {
  assert.deepEqual(validateCatalog(lessonFolders, lessonRegistry), []);
});

test('G6 Tập Hai lessons load, validate, and contain no long scored typing answers', async () => {
  const byId = new Map(lessonRegistry.map(entry => [entry.id, entry]));
  const longTyping = [];
  const contentErrors = [];

  for (const id of g6Tap2ExpectedLessonIds) {
    const entry = byId.get(id);
    const content = await entry.loadContent();
    for (const error of validateSet(content)) contentErrors.push(`${id}: ${error}`);
    for (const item of content.items ?? []) {
      if (isLongScoredTyping(item)) longTyping.push(`${id}/${item.id}: ${item.en}`);
    }
  }

  assert.deepEqual(contentErrors, []);
  assert.deepEqual(longTyping, []);
});
