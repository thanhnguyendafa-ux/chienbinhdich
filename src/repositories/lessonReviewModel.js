export const REVIEW_STATUS = Object.freeze({
  APPROVED: 'approved',
  NEEDS_EDIT: 'needs-edit'
});

export const REVIEW_VIEW = Object.freeze({
  UNREVIEWED: 'unreviewed',
  APPROVED: REVIEW_STATUS.APPROVED,
  NEEDS_EDIT: REVIEW_STATUS.NEEDS_EDIT,
  REREVIEW: 'rereview'
});

export function normalizeLessonReviewRecord(setId, data) {
  if (!data) return null;
  const status = String(data.status ?? '');
  if (!Object.values(REVIEW_STATUS).includes(status)) {
    throw new Error(`Lesson review ${setId} có status không hợp lệ.`);
  }
  const contentRevision = Number(data.contentRevision);
  const baseVersion = Number(data.baseVersion);
  if (!Number.isInteger(contentRevision) || contentRevision < 0) {
    throw new Error(`Lesson review ${setId} có contentRevision không hợp lệ.`);
  }
  if (!Number.isInteger(baseVersion) || baseVersion < 1) {
    throw new Error(`Lesson review ${setId} có baseVersion không hợp lệ.`);
  }
  return Object.freeze({
    setId: String(setId),
    status,
    note: String(data.note ?? ''),
    contentRevision,
    baseVersion,
    updatedAt: finiteOrNull(data.updatedAt),
    updatedBy: data.updatedBy ? String(data.updatedBy) : null
  });
}

export function lessonReviewDocumentFor(setId, { status, note = '', contentRevision = 0, baseVersion = 1 }, updatedBy, updatedAt = Date.now()) {
  if (!String(setId ?? '').trim()) throw new Error('setId is required.');
  if (!Object.values(REVIEW_STATUS).includes(status)) throw new Error('Review status must be approved or needs-edit.');
  if (!String(updatedBy ?? '').trim()) throw new Error('updatedBy is required.');
  if (!Number.isFinite(Number(updatedAt))) throw new Error('updatedAt must be finite.');
  const revision = Number(contentRevision);
  const version = Number(baseVersion);
  if (!Number.isInteger(revision) || revision < 0) throw new Error('contentRevision must be an integer >= 0.');
  if (!Number.isInteger(version) || version < 1) throw new Error('baseVersion must be an integer >= 1.');
  const normalizedNote = String(note ?? '').trim();
  if (normalizedNote.length > 2000) throw new Error('Review note must be 2000 characters or fewer.');
  return Object.freeze({
    setId: String(setId),
    status,
    note: normalizedNote,
    contentRevision: revision,
    baseVersion: version,
    updatedAt: Number(updatedAt),
    updatedBy: String(updatedBy)
  });
}

export function deriveLessonReviewState(lesson, review) {
  const currentRevision = Number(lesson?.contentPolicy?.revision ?? lesson?.contentRevision ?? 0);
  const baseVersion = Number(lesson?.version ?? lesson?.baseVersion ?? 1);
  const normalizedRevision = Number.isInteger(currentRevision) && currentRevision >= 0 ? currentRevision : 0;
  const normalizedBaseVersion = Number.isInteger(baseVersion) && baseVersion >= 1 ? baseVersion : 1;
  if (!review) {
    return Object.freeze({
      state: REVIEW_VIEW.UNREVIEWED,
      label: 'Chưa duyệt',
      contentRevision: normalizedRevision,
      baseVersion: normalizedBaseVersion,
      note: ''
    });
  }
  const stale = review.contentRevision !== normalizedRevision || review.baseVersion !== normalizedBaseVersion;
  const state = stale ? REVIEW_VIEW.REREVIEW : review.status;
  return Object.freeze({
    state,
    label: reviewLabel(state),
    contentRevision: normalizedRevision,
    baseVersion: normalizedBaseVersion,
    reviewedContentRevision: review.contentRevision,
    reviewedBaseVersion: review.baseVersion,
    note: review.note ?? '',
    updatedAt: review.updatedAt ?? null,
    updatedBy: review.updatedBy ?? null,
    stale
  });
}

export function lessonMatchesReviewFilter(reviewState, filter = 'all') {
  if (!filter || filter === 'all') return true;
  return reviewState?.state === filter;
}

export function reviewLabel(state) {
  return ({
    [REVIEW_VIEW.UNREVIEWED]: 'Chưa duyệt',
    [REVIEW_VIEW.APPROVED]: 'Đã duyệt',
    [REVIEW_VIEW.NEEDS_EDIT]: 'Cần chỉnh',
    [REVIEW_VIEW.REREVIEW]: 'Cần duyệt lại'
  })[state] ?? 'Chưa duyệt';
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
