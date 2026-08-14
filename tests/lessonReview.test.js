import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveLessonReviewState,
  lessonMatchesReviewFilter,
  lessonReviewDocumentFor,
  normalizeLessonReviewRecord,
  REVIEW_STATUS,
  REVIEW_VIEW
} from '../src/repositories/lessonReviewModel.js';

test('lesson review model stores Admin status, note and reviewed content snapshot', () => {
  const document = lessonReviewDocumentFor('g2u01-writing-01', {
    status: REVIEW_STATUS.NEEDS_EDIT,
    note: 'WORD nên dùng the pizza.',
    contentRevision: 2,
    baseVersion: 1
  }, 'admin-1', 1234);

  assert.deepEqual(document, {
    setId: 'g2u01-writing-01',
    status: 'needs-edit',
    note: 'WORD nên dùng the pizza.',
    contentRevision: 2,
    baseVersion: 1,
    updatedAt: 1234,
    updatedBy: 'admin-1'
  });

  const normalized = normalizeLessonReviewRecord('g2u01-writing-01', document);
  assert.equal(normalized.status, REVIEW_STATUS.NEEDS_EDIT);
  assert.equal(normalized.note, 'WORD nên dùng the pizza.');
  assert.equal(normalized.contentRevision, 2);
  assert.throws(() => lessonReviewDocumentFor('x', {
    status: 'unknown',
    contentRevision: 0,
    baseVersion: 1
  }, 'admin'));
});

test('unreviewed lesson has an explicit unreviewed state', () => {
  const state = deriveLessonReviewState({ id: 'lesson', version: 1, contentRevision: 0 }, null);
  assert.equal(state.state, REVIEW_VIEW.UNREVIEWED);
  assert.equal(state.label, 'Chưa duyệt');
  assert.equal(state.contentRevision, 0);
  assert.equal(state.baseVersion, 1);
});

test('approved and needs-edit states apply only to the exact reviewed revision', () => {
  const lesson = { id: 'lesson', version: 3, contentRevision: 4 };
  const approved = normalizeLessonReviewRecord('lesson', {
    setId: 'lesson', status: 'approved', note: '', contentRevision: 4, baseVersion: 3, updatedAt: 10, updatedBy: 'admin'
  });
  const needsEdit = normalizeLessonReviewRecord('lesson', {
    setId: 'lesson', status: 'needs-edit', note: 'Sửa cue.', contentRevision: 4, baseVersion: 3, updatedAt: 11, updatedBy: 'admin'
  });

  assert.equal(deriveLessonReviewState(lesson, approved).state, REVIEW_VIEW.APPROVED);
  assert.equal(deriveLessonReviewState(lesson, needsEdit).state, REVIEW_VIEW.NEEDS_EDIT);
});

test('publishing a new content revision automatically requires re-review', () => {
  const review = normalizeLessonReviewRecord('lesson', {
    setId: 'lesson', status: 'approved', note: 'Đã kiểm.', contentRevision: 1, baseVersion: 2, updatedAt: 10, updatedBy: 'admin'
  });
  const state = deriveLessonReviewState({ id: 'lesson', version: 2, contentRevision: 2 }, review);
  assert.equal(state.state, REVIEW_VIEW.REREVIEW);
  assert.equal(state.label, 'Cần duyệt lại');
  assert.equal(state.note, 'Đã kiểm.');
  assert.equal(state.reviewedContentRevision, 1);
  assert.equal(state.contentRevision, 2);
});

test('changing the Base lesson version automatically requires re-review', () => {
  const review = normalizeLessonReviewRecord('lesson', {
    setId: 'lesson', status: 'approved', note: '', contentRevision: 0, baseVersion: 1, updatedAt: 10, updatedBy: 'admin'
  });
  const state = deriveLessonReviewState({ id: 'lesson', version: 2, contentRevision: 0 }, review);
  assert.equal(state.state, REVIEW_VIEW.REREVIEW);
  assert.equal(state.reviewedBaseVersion, 1);
  assert.equal(state.baseVersion, 2);
});

test('review filters distinguish the four Admin QA states', () => {
  const states = [
    { state: REVIEW_VIEW.UNREVIEWED },
    { state: REVIEW_VIEW.APPROVED },
    { state: REVIEW_VIEW.NEEDS_EDIT },
    { state: REVIEW_VIEW.REREVIEW }
  ];
  assert.equal(states.filter(state => lessonMatchesReviewFilter(state, 'all')).length, 4);
  assert.equal(states.filter(state => lessonMatchesReviewFilter(state, 'approved')).length, 1);
  assert.equal(states.filter(state => lessonMatchesReviewFilter(state, 'needs-edit')).length, 1);
  assert.equal(states.filter(state => lessonMatchesReviewFilter(state, 'rereview')).length, 1);
  assert.equal(states.filter(state => lessonMatchesReviewFilter(state, 'unreviewed')).length, 1);
});
