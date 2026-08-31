import { expectedResponseDisplay, questionTypeForItem } from './questionTypes.js';

export const RAPID_RESPONSE_CONTRACT_VERSION = 1;
export const RAPID_TYPING_MIN_EXPECTED_LENGTH = 8;

const THRESHOLD_BY_TYPE = Object.freeze({
  mcq: 900,
  true_false: 900,
  typing: 1200,
  sentence_order: 1200,
  sequence_number: 1200,
  classification: 1200
});

export function rapidThresholdMsForItem(item) {
  const type = questionTypeForItem(item);
  if (type === 'typing' && expectedResponseDisplay(item).length < RAPID_TYPING_MIN_EXPECTED_LENGTH) return null;
  const threshold = THRESHOLD_BY_TYPE[type];
  return Number.isFinite(threshold) ? threshold : null;
}

export function isRapidResponseAttempt(attempt, item) {
  const thresholdMs = rapidThresholdMsForItem(item);
  if (thresholdMs === null || !Number.isFinite(Number(attempt?.responseDurationMs))) return false;
  return Number(attempt.responseDurationMs) < thresholdMs;
}

export function deriveRapidResponseSignals(attempts = [], set = {}) {
  const itemById = new Map((set?.items ?? []).map(item => [item.id, item]));
  const normalizedAttempts = Array.isArray(attempts) ? attempts : [];
  const rapid = normalizedAttempts.map(attempt => isRapidResponseAttempt(attempt, itemById.get(attempt?.itemId)));
  const rapidCount = rapid.filter(Boolean).length;
  let currentStreak = 0;
  let maxStreak = 0;
  for (const value of rapid) {
    currentStreak = value ? currentStreak + 1 : 0;
    maxStreak = Math.max(maxStreak, currentStreak);
  }
  const recentFive = rapid.slice(-5);
  const lastWasRapid = rapid.at(-1) === true;
  return Object.freeze({
    rapidCount,
    currentStreak,
    maxStreak,
    recentFiveCount: recentFive.filter(Boolean).length,
    lastWasRapid,
    shouldWarn: lastWasRapid && (currentStreak >= 2 || recentFive.filter(Boolean).length >= 3)
  });
}

export function rapidWarningForAttempts(attempts = [], set = {}) {
  const signals = deriveRapidResponseSignals(attempts, set);
  if (!signals.shouldWarn) return null;
  return Object.freeze({
    type: 'rapid_response',
    occurrenceNumber: signals.rapidCount,
    rapidCount: signals.rapidCount,
    currentStreak: signals.currentStreak,
    maxStreak: signals.maxStreak
  });
}
