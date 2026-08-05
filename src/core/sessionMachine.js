import { evaluateAnswer } from './answerEvaluator.js';
import { getMasteryCounts, masteryDisplayPercent, masteryPercentFromAttempts, masteryUnitPercent } from './masteryEngine.js';
import { advanceLearningPrompt, queueRetry } from './retryScheduler.js';

export const SESSION_SCHEMA_VERSION = 5;

export function createSession({ studentName, set, now = Date.now() }) {
  const firstItem = set.items[0];
  if (!firstItem) throw new Error('Set must contain at least one item.');

  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    id: createSessionId(now),
    studentName: studentName.trim(),
    setId: set.id,
    setVersion: set.version ?? 1,
    startedAt: now,
    completedAt: null,
    submittedAt: null,
    status: 'active',
    currentItemId: firstItem.id,
    currentPromptKind: 'main',
    promptIndex: 0,
    mainCursor: 1,
    retryQueue: [],
    attempts: []
  };
}

export function submitAnswer({ session, set, answer, attemptMeta = {}, now = Date.now() }) {
  if (session.status !== 'active') return { session, event: { type: session.status } };
  const item = set.items.find(candidate => candidate.id === session.currentItemId);
  if (!item) throw new Error(`Current item not found: ${session.currentItemId}`);

  const exposureAttempts = session.attempts.filter(attempt => attempt.promptIndex === session.promptIndex);
  const itemAttempts = session.attempts.filter(attempt => attempt.itemId === item.id);
  const attemptNumber = exposureAttempts.length + 1;
  const itemAttemptNumber = itemAttempts.length + 1;
  const hadWrongThisExposure = exposureAttempts.some(attempt => !attempt.correct);
  const hasSeenAnswer = exposureAttempts.some(attempt => attempt.answerRevealedAfterAttempt === true);
  const failedAttemptsBefore = exposureAttempts.filter(attempt => !attempt.correct).length;
  const result = evaluateAnswer(answer, item.en);
  const submittedAt = finiteTime(attemptMeta.submittedAt, now);
  const startedAt = finiteTime(attemptMeta.startedAt, submittedAt);
  const revealAfterAttempt = !result.correct && (hasSeenAnswer || failedAttemptsBefore + 1 >= 2);
  const masteryDeltaUnits = attemptNumber === 1 ? (result.correct ? 1 : -1) : 0;
  const masteryBefore = masteryDisplayPercent(session.attempts, set.items.length);

  const attempt = {
    id: `${session.id}-p${session.promptIndex}-a${attemptNumber}`,
    itemId: item.id,
    promptIndex: session.promptIndex,
    promptKind: session.currentPromptKind,
    attemptNumber,
    itemAttemptNumber,
    submittedAnswer: result.normalizedInput,
    correct: result.correct,
    result: resolveAttemptResult({ correct: result.correct, hadWrongThisExposure, revealAfterAttempt }),
    masteryDeltaUnits,
    startedAt,
    submittedAt,
    responseDurationMs: Math.max(0, submittedAt - startedAt),
    inputMethod: normalizeInputMethod(attemptMeta.inputMethod),
    pasteDetected: Boolean(attemptMeta.pasteDetected),
    answerRevealedBeforeAttempt: hasSeenAnswer,
    answerRevealedAfterAttempt: revealAfterAttempt || hasSeenAnswer
  };

  let nextSession = structuredClone(session);
  nextSession.attempts.push(attempt);
  const mastery = masteryDisplayPercent(nextSession.attempts, set.items.length);
  const masteryDeltaPercent = round2(mastery - masteryBefore);

  if (!result.correct) {
    nextSession.retryQueue = queueRetry(nextSession.retryQueue, item.id, session.promptIndex);
    return {
      session: nextSession,
      event: {
        type: revealAfterAttempt ? 'incorrect_reveal' : 'incorrect_retry',
        entered: result.normalizedInput,
        revealAnswer: revealAfterAttempt ? item.en : null,
        attemptNumber,
        masteryDeltaUnits,
        masteryBefore,
        masteryDeltaPercent,
        mastery
      }
    };
  }

  const wasCorrection = hadWrongThisExposure;
  nextSession = advanceLearningPrompt(nextSession, set);

  return {
    session: nextSession,
    event: {
      type: wasCorrection ? 'correction' : 'retrieval_success',
      answer: item.en,
      masteryDeltaUnits,
      masteryBefore,
      masteryDeltaPercent,
      mastery,
      passed: nextSession.status === 'passed'
    }
  };
}

export function abandonSession(session, now = Date.now()) {
  if (session.status === 'submitted' || session.status === 'abandoned') return session;
  return {
    ...session,
    status: 'abandoned',
    completedAt: now
  };
}

export function submitPassedSession(session, now = Date.now()) {
  if (session.status !== 'passed') return session;
  return {
    ...session,
    status: 'submitted',
    submittedAt: now,
    completedAt: now
  };
}

export function getCurrentItem(session, set) {
  return set.items.find(item => item.id === session.currentItemId) ?? null;
}

export function getSessionMetrics(session, set, now = Date.now()) {
  const attempts = session.attempts ?? [];
  const masteryExact = masteryPercentFromAttempts(attempts, set.items.length);
  const mastery = masteryDisplayPercent(attempts, set.items.length);
  const counts = getMasteryCounts(attempts);
  const completedMainIds = new Set(
    attempts.filter(attempt => attempt.promptKind === 'main' && attempt.correct).map(attempt => attempt.itemId)
  );
  const correctedPromptIds = new Set(
    attempts.filter(attempt => attempt.result === 'correction').map(attempt => attempt.promptIndex)
  );
  const revealedPromptIds = new Set(
    attempts.filter(attempt => attempt.answerRevealedAfterAttempt).map(attempt => attempt.promptIndex)
  );
  const retryPromptIds = new Set(
    attempts.filter(attempt => attempt.promptKind === 'retry').map(attempt => attempt.promptIndex)
  );

  return {
    total: set.items.length,
    completedMainItems: completedMainIds.size,
    mainComplete: completedMainIds.size >= set.items.length,
    totalAttempts: attempts.length,
    retrievalSuccesses: counts.gains,
    retrievalErrors: counts.losses,
    corrections: correctedPromptIds.size,
    revealedCount: revealedPromptIds.size,
    retryCount: retryPromptIds.size,
    mastery,
    masteryExact,
    masteryUnit: masteryUnitPercent(set.items.length),
    thresholdReached: masteryExact >= set.passThreshold,
    passed: session.status === 'passed' || session.status === 'submitted',
    submitted: session.status === 'submitted',
    abandoned: session.status === 'abandoned',
    durationMs: (session.completedAt ?? now) - session.startedAt
  };
}

function resolveAttemptResult({ correct, hadWrongThisExposure, revealAfterAttempt }) {
  if (correct) return hadWrongThisExposure ? 'correction' : 'retrieval_success';
  return revealAfterAttempt ? 'incorrect_reveal' : 'incorrect_retry';
}

function normalizeInputMethod(value) {
  return ['typed', 'paste', 'mixed', 'unknown'].includes(value) ? value : 'unknown';
}

function finiteTime(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function createSessionId(now) {
  const timePart = now.toString(36).slice(-4).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MRT-${timePart}${randomPart}`;
}
