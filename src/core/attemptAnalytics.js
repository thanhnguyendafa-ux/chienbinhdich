import { deriveRapidResponseSignals, isRapidResponseAttempt } from './rapidResponsePolicy.js';

export function deriveAttemptAnalytics(session, set) {
  const itemById = new Map(set.items.map(item => [item.id, item]));
  const attempts = session.attempts ?? [];
  const pasteAttempts = attempts.filter(attempt => attempt.pasteDetected);
  const rapidAttempts = attempts.filter(attempt => isRapidResponseAttempt(attempt, itemById.get(attempt.itemId)));
  const durations = attempts.map(attempt => attempt.responseDurationMs).filter(Number.isFinite).slice().sort((a, b) => a - b);
  const rapidSignals = deriveRapidResponseSignals(attempts, set);

  return {
    pasteCount: pasteAttempts.length,
    rapidCount: rapidAttempts.length,
    rapidMaxStreak: rapidSignals.maxStreak,
    medianResponseMs: median(durations),
    flaggedAttemptIds: new Set([...pasteAttempts, ...rapidAttempts].map(attempt => attempt.id)),
    attempts: attempts.map(attempt => ({
      ...attempt,
      flags: buildFlags(attempt, itemById.get(attempt.itemId))
    }))
  };
}

export function isRapidAttempt(attempt, item) {
  return isRapidResponseAttempt(attempt, item);
}

function buildFlags(attempt, item) {
  const flags = [];
  if (attempt.pasteDetected) flags.push('paste');
  if (isRapidResponseAttempt(attempt, item)) flags.push('rapid');
  if (attempt.answerRevealedBeforeAttempt) flags.push('answer_seen');
  return flags;
}

function median(sortedValues) {
  if (!sortedValues.length) return 0;
  const middle = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2) return sortedValues[middle];
  return Math.round((sortedValues[middle - 1] + sortedValues[middle]) / 2);
}
