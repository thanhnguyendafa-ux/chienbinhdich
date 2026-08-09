import { masteryDisplayPercent } from './masteryEngine.js';

export function deriveAssignmentSummary(session = {}, set = {}, now = Date.now()) {
  const items = Array.isArray(set?.items) ? set.items : [];
  const itemIds = new Set(items.map(item => item.id));
  const attempts = Array.isArray(session?.attempts) ? session.attempts : [];
  const firstMainAttemptByItem = new Map();

  for (const attempt of attempts) {
    if (attempt?.promptKind !== 'main') continue;
    if (!itemIds.has(attempt?.itemId)) continue;
    if (Number(attempt?.attemptNumber ?? 1) !== 1) continue;
    if (firstMainAttemptByItem.has(attempt.itemId)) continue;
    firstMainAttemptByItem.set(attempt.itemId, attempt);
  }

  const firstMainAttempts = [...firstMainAttemptByItem.values()];
  const correctFirstTry = firstMainAttempts.filter(attempt => attempt.correct === true).length;
  const wrongFirstTry = firstMainAttempts.filter(attempt => attempt.correct !== true).length;
  const attemptedItems = firstMainAttempts.length;
  const totalItems = items.length;
  const unansweredItems = Math.max(0, totalItems - attemptedItems);
  const startedAt = finiteTimestamp(session?.startedAt) ?? finiteTimestamp(now) ?? 0;
  const endedAt = finiteTimestamp(session?.completedAt)
    ?? finiteTimestamp(session?.submittedAt)
    ?? finiteTimestamp(now)
    ?? startedAt;

  return {
    totalItems,
    attemptedItems,
    correctFirstTry,
    wrongFirstTry,
    unansweredItems,
    mastery: masteryDisplayPercent(attempts, totalItems),
    durationMs: Math.max(0, endedAt - startedAt),
    status: assignmentStatus(session?.status)
  };
}

function assignmentStatus(status) {
  if (status === 'abandoned') return 'abandoned';
  if (['passed', 'extended', 'submitted'].includes(status)) return 'passed';
  return 'in_progress';
}

function finiteTimestamp(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
