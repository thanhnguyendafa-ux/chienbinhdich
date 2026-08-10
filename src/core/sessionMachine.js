import { evaluateQuestion, expectedResponseDisplay, questionTypeForItem } from './questionTypes.js';
import { getMasteryCounts, getMasteryTransitions, masteryDisplayPercent, masteryPercentFromAttempts, masteryUnitPercent } from './masteryEngine.js';
import { sessionPassThreshold } from './masteryPolicy.js';
import { sessionTypingTolerance } from './typingPolicy.js';
import { advanceLearningPrompt, queueRetry } from './retryScheduler.js';

export const SESSION_SCHEMA_VERSION = 7;

export function createSession({ studentName, set, now = Date.now() }) {
  const firstItem = set.items[0];
  if (!firstItem) throw new Error('Set must contain at least one item.');

  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    id: createSessionId(now),
    studentName: studentName.trim(),
    setId: set.id,
    setVersion: set.version ?? 1,
    passThresholdAtStart: sessionPassThreshold(null, set),
    typingToleranceAtStart: sessionTypingTolerance(null, set),
    startedAt: now,
    completedAt: null,
    submittedAt: null,
    qualifiedAt: null,
    extendedPracticeStartedAt: null,
    extendedPracticeEndedAt: null,
    status: 'active',
    currentItemId: firstItem.id,
    currentPromptKind: 'main',
    promptIndex: 0,
    mainCursor: 1,
    retryQueue: [],
    attempts: []
  };
}

export function submitAnswer({ session, set, response, answer, attemptMeta = {}, now = Date.now() }) {
  if (!['active', 'extended'].includes(session.status)) return { session, event: { type: session.status } };
  const item = set.items.find(candidate => candidate.id === session.currentItemId);
  if (!item) throw new Error(`Current item not found: ${session.currentItemId}`);

  const exposureAttempts = session.attempts.filter(attempt => attempt.promptIndex === session.promptIndex);
  const itemAttempts = session.attempts.filter(attempt => attempt.itemId === item.id);
  const attemptNumber = exposureAttempts.length + 1;
  const itemAttemptNumber = itemAttempts.length + 1;
  const hadWrongThisExposure = exposureAttempts.some(attempt => !attempt.correct);
  const hasSeenAnswer = exposureAttempts.some(attempt => attempt.answerRevealedAfterAttempt === true);
  const failedAttemptsBefore = exposureAttempts.filter(attempt => !attempt.correct).length;
  const submittedResponse = response === undefined ? answer : response;
  const result = evaluateQuestion(item, submittedResponse, {
    typingTolerance: sessionTypingTolerance(session, set)
  });
  const submittedAt = finiteTime(attemptMeta.submittedAt, now);
  const startedAt = finiteTime(attemptMeta.startedAt, submittedAt);
  const revealAfterAttempt = !result.correct && (hasSeenAnswer || failedAttemptsBefore + 1 >= 2);
  const masteryDeltaUnits = attemptNumber === 1 ? (result.correct ? 1 : -1) : 0;
  const masteryBefore = masteryDisplayPercent(session.attempts, set.items.length);
  const expectedDisplay = expectedResponseDisplay(item);

  const attempt = {
    id: `${session.id}-p${session.promptIndex}-a${attemptNumber}`,
    itemId: item.id,
    questionType: questionTypeForItem(item),
    promptIndex: session.promptIndex,
    promptKind: session.currentPromptKind,
    attemptNumber,
    itemAttemptNumber,
    submittedResponse: result.normalizedResponse,
    submittedAnswer: result.displayResponse,
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
        entered: result.displayResponse,
        revealAnswer: revealAfterAttempt ? expectedDisplay : null,
        attemptNumber,
        masteryDeltaUnits,
        masteryBefore,
        masteryDeltaPercent,
        mastery
      }
    };
  }

  const wasCorrection = hadWrongThisExposure;
  nextSession = qualifySessionIfEligible(nextSession, set);
  if (nextSession.status !== 'passed') nextSession = advanceLearningPrompt(nextSession, set);

  return {
    session: nextSession,
    event: {
      type: wasCorrection ? 'correction' : 'retrieval_success',
      entered: result.displayResponse,
      answer: expectedDisplay,
      masteryDeltaUnits,
      masteryBefore,
      masteryDeltaPercent,
      mastery,
      passed: nextSession.status === 'passed'
    }
  };
}

export function qualifySessionIfEligible(session, set) {
  if (session?.status !== 'active') return session;
  if (!completionPolicySatisfied(session, set)) return session;
  const threshold = sessionPassThreshold(session, set);
  if (masteryPercentFromAttempts(session.attempts, set.items.length) < threshold) return session;

  return {
    ...session,
    status: 'passed',
    qualifiedAt: session.qualifiedAt ?? firstQualificationTimestamp(session.attempts, set.items.length, threshold)
  };
}

export function continueQualifiedSession(session, set, now = Date.now()) {
  if (session.status !== 'passed') return session;
  const extended = {
    ...session,
    status: 'extended',
    qualifiedAt: session.qualifiedAt ?? now,
    extendedPracticeStartedAt: session.extendedPracticeStartedAt ?? now,
    completedAt: null,
    submittedAt: null
  };
  return advanceLearningPrompt(extended, set);
}

export function abandonSession(session, now = Date.now()) {
  if (session.status === 'submitted' || session.status === 'abandoned') return session;
  return { ...session, status: 'abandoned', completedAt: now };
}

export function submitPassedSession(session, now = Date.now()) {
  if (!['passed', 'extended'].includes(session.status)) return session;
  return {
    ...session,
    status: 'submitted',
    submittedAt: now,
    completedAt: now,
    extendedPracticeEndedAt: session.status === 'extended' ? now : session.extendedPracticeEndedAt
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
  const qualifiedAt = session.qualifiedAt ?? null;
  const attemptsAtQualification = qualifiedAt
    ? attempts.filter(attempt => Number(attempt.submittedAt) <= Number(qualifiedAt))
    : [];
  const extendedPractice = Boolean(session.extendedPracticeStartedAt);
  const extraPracticeEnd = session.extendedPracticeEndedAt ?? session.submittedAt ?? (extendedPractice ? now : null);
  const passThreshold = sessionPassThreshold(session, set);

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
    passThreshold,
    thresholdReached: Boolean(qualifiedAt) || masteryExact >= passThreshold,
    qualifiedAt,
    masteryAtQualification: qualifiedAt ? masteryPercentFromAttempts(attemptsAtQualification, set.items.length) : null,
    extendedPractice,
    extendedPracticeStartedAt: session.extendedPracticeStartedAt ?? null,
    extendedPracticeDurationMs: extendedPractice && extraPracticeEnd ? Math.max(0, extraPracticeEnd - session.extendedPracticeStartedAt) : 0,
    extendedAttempts: extendedPractice ? attempts.filter(attempt => attempt.submittedAt >= session.extendedPracticeStartedAt).length : 0,
    passed: ['passed', 'extended', 'submitted'].includes(session.status) || Boolean(qualifiedAt),
    submitted: session.status === 'submitted',
    abandoned: session.status === 'abandoned',
    durationMs: (session.completedAt ?? now) - session.startedAt
  };
}

function completionPolicySatisfied(session, set) {
  if (set?.completionPolicy !== 'all-items') return true;
  const totalItems = Array.isArray(set?.items) ? set.items.length : 0;
  return totalItems > 0 && Number(session?.mainCursor ?? 0) >= totalItems;
}

function firstQualificationTimestamp(attempts, totalItems, threshold) {
  const transitions = getMasteryTransitions(attempts, totalItems);
  const crossingIndex = transitions.findIndex(transition => transition.after >= threshold);
  if (crossingIndex < 0) return null;
  const timestamp = Number(attempts[crossingIndex]?.submittedAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function resolveAttemptResult({ correct, hadWrongThisExposure, revealAfterAttempt }) {
  if (correct) return hadWrongThisExposure ? 'correction' : 'retrieval_success';
  return revealAfterAttempt ? 'incorrect_reveal' : 'incorrect_retry';
}

function normalizeInputMethod(value) {
  return ['typed', 'paste', 'mixed', 'choice', 'tap', 'unknown'].includes(value) ? value : 'unknown';
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
