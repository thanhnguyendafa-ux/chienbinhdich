import { evaluateAnswer } from './answerEvaluator.js';
import { getFirstTryCorrectCount, hasPassedScore, scorePercentFromAttempts } from './scoreEngine.js';

export const SESSION_SCHEMA_VERSION = 2;

export function createSession({ studentName, set, now = Date.now() }) {
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    id: createSessionId(now),
    studentName: studentName.trim(),
    setId: set.id,
    setVersion: set.version ?? 1,
    startedAt: now,
    completedAt: null,
    currentIndex: 0,
    attempts: [],
    status: 'in_progress'
  };
}

export function submitAnswer({ session, set, answer, attemptMeta = {}, now = Date.now() }) {
  const item = set.items[session.currentIndex];
  if (!item) return { session, event: { type: 'finished' } };

  const previousAttempts = session.attempts.filter(attempt => attempt.itemId === item.id);
  const attemptNumber = previousAttempts.length + 1;
  const hasSeenAnswer = previousAttempts.some(attempt => attempt.answerRevealedAfterAttempt === true);
  const result = evaluateAnswer(answer, item.en);
  const submittedAt = finiteTime(attemptMeta.submittedAt, now);
  const startedAt = finiteTime(attemptMeta.startedAt, submittedAt);
  const failedAttemptsBefore = previousAttempts.filter(attempt => !attempt.correct).length;
  const revealAfterAttempt = !result.correct && (hasSeenAnswer || failedAttemptsBefore + 1 >= 2);
  const inputMethod = normalizeInputMethod(attemptMeta.inputMethod);

  const attempt = {
    id: `${session.id}-${item.id}-${attemptNumber}`,
    itemId: item.id,
    attemptNumber,
    submittedAnswer: result.normalizedInput,
    correct: result.correct,
    result: resolveAttemptResult({ correct: result.correct, attemptNumber, revealAfterAttempt }),
    startedAt,
    submittedAt,
    responseDurationMs: Math.max(0, submittedAt - startedAt),
    inputMethod,
    pasteDetected: Boolean(attemptMeta.pasteDetected),
    answerRevealedBeforeAttempt: hasSeenAnswer,
    answerRevealedAfterAttempt: revealAfterAttempt || hasSeenAnswer
  };

  const nextSession = structuredClone(session);
  nextSession.attempts.push(attempt);

  if (!result.correct) {
    return {
      session: nextSession,
      event: {
        type: revealAfterAttempt ? 'incorrect_reveal' : 'incorrect_retry',
        entered: result.normalizedInput,
        revealAnswer: revealAfterAttempt ? item.en : null,
        attemptNumber
      }
    };
  }

  nextSession.currentIndex += 1;
  const completed = nextSession.currentIndex >= set.items.length;
  if (completed) {
    nextSession.completedAt = submittedAt;
    nextSession.status = 'completed';
  }

  const score = scorePercentFromAttempts(nextSession.attempts, set.items.length);
  return {
    session: nextSession,
    event: {
      type: attemptNumber === 1 ? 'correct_first_try' : 'corrected',
      completed,
      score,
      passed: completed ? hasPassedScore(nextSession.attempts, set.items.length, set.passThreshold) : false
    }
  };
}

export function getSessionMetrics(session, set, now = Date.now()) {
  const total = set.items.length;
  const attempts = session.attempts ?? [];
  const firstTryCorrect = getFirstTryCorrectCount(attempts);
  const score = scorePercentFromAttempts(attempts, total);
  const correctedItemIds = new Set();
  const revealedItemIds = new Set();
  const groupedAttempts = new Map();

  for (const attempt of attempts) {
    if (!groupedAttempts.has(attempt.itemId)) groupedAttempts.set(attempt.itemId, []);
    groupedAttempts.get(attempt.itemId).push(attempt);
  }

  for (const item of set.items) {
    const itemAttempts = groupedAttempts.get(item.id) ?? [];
    if (itemAttempts.length > 1 && itemAttempts.some(attempt => attempt.correct)) correctedItemIds.add(item.id);
    if (itemAttempts.some(attempt => attempt.answerRevealedAfterAttempt)) revealedItemIds.add(item.id);
  }

  return {
    total,
    completedItems: Math.min(session.currentIndex, total),
    firstTryCorrect,
    correctedCount: correctedItemIds.size,
    revealedCount: revealedItemIds.size,
    totalAttempts: attempts.length,
    score,
    passed: session.status === 'completed' && score >= set.passThreshold,
    durationMs: (session.completedAt ?? now) - session.startedAt
  };
}

function resolveAttemptResult({ correct, attemptNumber, revealAfterAttempt }) {
  if (correct) return attemptNumber === 1 ? 'correct_first_try' : 'corrected';
  return revealAfterAttempt ? 'incorrect_reveal' : 'incorrect_retry';
}

function normalizeInputMethod(value) {
  return ['typed', 'paste', 'mixed', 'unknown'].includes(value) ? value : 'unknown';
}

function finiteTime(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function createSessionId(now) {
  const timePart = now.toString(36).slice(-4).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MRT-${timePart}${randomPart}`;
}
