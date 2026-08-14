import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

test('lessonReviews are Admin-only and validate reviewed content snapshots', () => {
  assert.match(rules, /function validLessonReview\(setId\)/);
  assert.match(rules, /match \/lessonReviews\/\{setId\}/);
  assert.match(rules, /allow get, list: if isAdmin\(\)/);
  assert.match(rules, /allow create, update: if isAdmin\(\) && validLessonReview\(setId\)/);
  assert.match(rules, /request\.resource\.data\.contentRevision >= 0/);
  assert.match(rules, /request\.resource\.data\.baseVersion >= 1/);
  assert.doesNotMatch(rules, /match \/lessonReviews\/\{setId\}[\s\S]{0,220}allow get: if signedIn\(\)/);
});
