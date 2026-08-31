import { assessmentSetForSession, scoredItemCount, MASTERY_MODE_COMPLETION } from './assessmentPolicy.js';
import { effortQualification } from './effortPassPolicy.js';
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
  const accuracyAttempts = firstMainAttempts.filter(attempt => attempt.masteryMode !== MASTERY_MODE_COMPLETION);
  const completionAttempts = firstMainAttempts.filter(attempt => attempt.masteryMode === MASTERY_MODE_COMPLETION);
  const correctFirstTry = accuracyAttempts.filter(attempt => attempt.correct === true).length;
  const wrongFirstTry = accuracyAttempts.filter(attempt => attempt.correct === false).length;
  const completedFirstTry = completionAttempts.filter(attempt => attempt.completed === true || attempt.masteryAchieved === true).length;
  const incompleteFirstTry = completionAttempts.filter(attempt => attempt.completed === false || attempt.masteryAchieved === false).length;
  const attemptedItems = firstMainAttempts.length;
  const totalItems = items.length;
  const unansweredItems = Math.max(0, totalItems - attemptedItems);
  const assessmentSet = assessmentSetForSession(session, set);
  const masteryTotal = scoredItemCount(assessmentSet);
  const masteryEarned = Math.min(
    masteryTotal,
    Math.max(0, attempts.reduce((total, attempt) => total + Number(attempt.masteryDeltaUnits ?? 0), 0))
  );
  const startedAt = finiteTimestamp(session?.startedAt) ?? finiteTimestamp(now) ?? 0;
  const endedAt = finiteTimestamp(session?.completedAt)
    ?? finiteTimestamp(session?.submittedAt)
    ?? finiteTimestamp(now)
    ?? startedAt;
  const effort = effortQualification(session, set, now);

  return {
    totalItems,
    attemptedItems,
    correctFirstTry,
    wrongFirstTry,
    completedFirstTry,
    incompleteFirstTry,
    unansweredItems,
    masteryTotal,
    masteryEarned,
    mastery: masteryDisplayPercent(attempts, masteryTotal),
    durationMs: Math.max(0, endedAt - startedAt),
    effortActiveMs: effort.elapsedMs,
    effortTargetMs: effort.targetMs,
    effortPassEnabled: effort.enabled,
    qualificationReason: session?.qualificationReason ?? (session?.qualifiedAt ? 'mastery' : null),
    effortMsAtQualification: finiteTimestamp(session?.effortMsAtQualification),
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
