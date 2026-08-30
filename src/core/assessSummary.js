import { assessableItems, assessPercent } from './assessScoringPolicy.js';
import { evaluateQuestion, expectedResponseDisplay } from './questionTypes.js';

export function deriveAssessSummary(attempts, set, options = {}) {
  const items = assessableItems(set);
  const firstAttemptByItem = firstAttemptMap(attempts);
  const details = [];
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const item of items) {
    const attempt = firstAttemptByItem.get(String(item.id)) ?? null;
    if (!attempt || attempt.skipped === true) {
      unanswered += 1;
      details.push(detailFor(item, attempt, null, 'unanswered'));
      continue;
    }

    const result = evaluateQuestion(item, attempt.submittedResponse, {
      typingTolerance: options.typingTolerance === true
    });
    if (result.correct) correct += 1;
    else incorrect += 1;
    details.push(detailFor(item, attempt, result, result.correct ? 'correct' : 'incorrect'));
  }

  return Object.freeze({
    correct,
    incorrect,
    unanswered,
    assessableTotal: items.length,
    percent: assessPercent(correct, items.length),
    details: Object.freeze(details)
  });
}

function firstAttemptMap(attempts = []) {
  const ordered = [...attempts].sort((a, b) => {
    const byTime = Number(a?.submittedAt ?? 0) - Number(b?.submittedAt ?? 0);
    if (byTime !== 0) return byTime;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
  const map = new Map();
  for (const attempt of ordered) {
    const key = String(attempt?.itemId ?? '');
    if (key && !map.has(key)) map.set(key, attempt);
  }
  return map;
}

function detailFor(item, attempt, result, status) {
  return Object.freeze({
    itemId: String(item.id),
    status,
    submittedResponse: attempt?.submittedResponse ?? null,
    submittedAnswer: String(attempt?.submittedAnswer ?? ''),
    expectedAnswer: expectedResponseDisplay(item),
    correct: result ? Boolean(result.correct) : null,
    submittedAt: Number(attempt?.submittedAt ?? 0) || null,
    responseDurationMs: Number(attempt?.responseDurationMs ?? 0) || 0,
    pasteDetected: attempt?.pasteDetected === true,
    inputMethod: String(attempt?.inputMethod ?? 'unknown')
  });
}
