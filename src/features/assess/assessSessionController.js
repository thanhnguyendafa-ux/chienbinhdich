export function currentAssessItem(session, lesson) {
  const index = currentIndex(session);
  return lesson?.items?.[index] ?? null;
}

export function assessProgress(session, lesson) {
  const total = lesson?.items?.length ?? 0;
  const index = Math.min(currentIndex(session), total);
  return Object.freeze({
    index,
    number: Math.min(index + 1, total),
    total,
    complete: total > 0 && index >= total
  });
}

export function advanceAssessSession(session, lesson, { attemptId, now = Date.now() } = {}) {
  if (session?.status !== 'active') return session;
  const total = lesson?.items?.length ?? 0;
  const nextIndex = Math.min(currentIndex(session) + 1, total);
  return Object.freeze({
    ...session,
    currentItemIndex: nextIndex,
    currentItemId: lesson?.items?.[nextIndex]?.id ?? null,
    mainCursor: nextIndex,
    attemptCount: Math.max(Number(session.attemptCount ?? 0) + 1, nextIndex),
    lastAttemptId: attemptId ?? session.lastAttemptId ?? null,
    updatedAt: now
  });
}

export function submitAssessSession(session, now = Date.now()) {
  if (session?.status === 'submitted') return session;
  return Object.freeze({
    ...session,
    status: 'submitted',
    submittedAt: now,
    completedAt: now,
    currentItemId: null,
    updatedAt: now
  });
}

function currentIndex(session) {
  const value = Number(session?.currentItemIndex ?? session?.mainCursor ?? 0);
  return Number.isInteger(value) && value >= 0 ? value : 0;
}
