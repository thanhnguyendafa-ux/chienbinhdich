import { expectedResponseDisplay, questionTypeForItem } from './questionTypes.js';

const RAPID_THRESHOLD_MS = 1200;
const RAPID_MIN_EXPECTED_LENGTH = 8;

export function deriveAttemptAnalytics(session, set) {
  const itemById = new Map(set.items.map(item => [item.id, item]));
  const attempts = session.attempts ?? [];
  const pasteAttempts = attempts.filter(attempt => attempt.pasteDetected);
  const rapidAttempts = attempts.filter(attempt => isRapidAttempt(attempt, itemById.get(attempt.itemId)));
  const durations = attempts.map(attempt => attempt.responseDurationMs).filter(Number.isFinite).slice().sort((a, b) => a - b);

  return {
    pasteCount: pasteAttempts.length,
    rapidCount: rapidAttempts.length,
    medianResponseMs: median(durations),
    flaggedAttemptIds: new Set([...pasteAttempts, ...rapidAttempts].map(attempt => attempt.id)),
    attempts: attempts.map(attempt => ({
      ...attempt,
      flags: buildFlags(attempt, itemById.get(attempt.itemId))
    }))
  };
}

export function isRapidAttempt(attempt, item) {
  if (!item || !Number.isFinite(attempt.responseDurationMs)) return false;
  if (questionTypeForItem(item) !== 'typing') return false;
  return expectedResponseDisplay(item).length >= RAPID_MIN_EXPECTED_LENGTH && attempt.responseDurationMs < RAPID_THRESHOLD_MS;
}

function buildFlags(attempt, item) {
  const flags = [];
  if (attempt.pasteDetected) flags.push('paste');
  if (isRapidAttempt(attempt, item)) flags.push('rapid');
  if (attempt.answerRevealedBeforeAttempt) flags.push('answer_seen');
  return flags;
}

function median(sortedValues) {
  if (!sortedValues.length) return 0;
  const middle = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2) return sortedValues[middle];
  return Math.round((sortedValues[middle - 1] + sortedValues[middle]) / 2);
}
