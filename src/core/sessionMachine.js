import {
  assessmentModeForItem,
  assessmentSetForSession,
  isScoredItem,
  masteryModeForItem,
  scoredItemCount,
  MASTERY_MODE_COMPLETION,
  WORKBOOK_ALL_ITEMS_ASSESSMENT
} from './assessmentPolicy.js';
import { deliverySnapshotFor, DELIVERY_MODE_MASTERY } from './deliveryMode.js';
import { effortQualification, sessionEffortPassPolicy } from './effortPassPolicy.js';
import { queueIntegrityWarning } from './integrityTracker.js';
import { evaluateQuestion, expectedResponseDisplay, questionTypeForItem } from './questionTypes.js';
import { rapidWarningForAttempts } from './rapidResponsePolicy.js';
import { typingErrorMapEnabled } from './typingErrorMap.js';
import { getMasteryCounts, getMasteryTransitions, masteryDisplayPercent, masteryPercentFromAttempts, masteryUnitPercent } from './masteryEngine.js';
import { masteryDeltaForAttempt } from './masteryScoringPolicy.js';
import { sessionPassThreshold } from './masteryPolicy.js';
import { sessionTypingTolerance } from './typingPolicy.js';
import { advanceLearningPrompt, queueRetry } from './retryScheduler.js';

export const SESSION_SCHEMA_VERSION = 8;
export const SESSION_INSTRUCTIONS_CONTRACT_VERSION = 1;
const EXPLAIN_ACCEPT_POLICY = 'explain-and-accept';

export function createSession({ studentName, set, now = Date.now() }) {
  const firstItem = set.items[0];
  if (!firstItem) throw new Error('Set must contain at least one item.');
  const delivery = deliverySnapshotFor(DELIVERY_MODE_MASTERY);
  const effort = sessionEffortPassPolicy(null, set);

  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    id: createSessionId(now),
    studentName: studentName.trim(),
    setId: set.id,
    setVersion: set.version ?? 1,
    ...delivery,
    passThresholdAtStart: sessionPassThreshold(null, set),
    typingToleranceAtStart: sessionTypingTolerance(null, set),
    effortPassEnabledAtStart: effort.enabled === true,
    effortTargetMinutesAtStart: effort.minutes,
    assessmentPolicyAtStart: set.assessmentPolicy ?? null,
    assessmentContractVersionAtStart: set.assessmentContractVersion ?? null,
    completionPolicyAtStart: set.completionPolicy ?? null,
    instructionsContractVersion: SESSION_INSTRUCTIONS_CONTRACT_VERSION,
    instructionsAcknowledgedAt: now,
    startedAt: now,
    completedAt: null,
    submittedAt: null,
    qualifiedAt: null,
    qualificationReason: null,
    effortMsAtQualification: null,
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

  const assessmentSet = assessmentSetForSession(session, set);
  const masteryMode = masteryModeForItem(assessmentSet, item);
  const completionMode = masteryMode === MASTERY_MODE_COMPLETION;
  const exposureAttempts = session.attempts.filter(attempt => attempt.promptIndex === session.promptIndex);
  const itemAttempts = session.attempts.filter(attempt => attempt.itemId === item.id);
  const attemptNumber = exposureAttempts.length + 1;
  const itemAttemptNumber = itemAttempts.length + 1;
  const hadWrongThisExposure = exposureAttempts.some(attempt => attemptFailed(attempt));
  const hasSeenAnswer = exposureAttempts.some(attempt => attempt.answerRevealedAfterAttempt === true);
  const failedAttemptsBefore = exposureAttempts.filter(attempt => attemptFailed(attempt)).length;
  const submittedResponse = response === undefined ? answer : response;
  const typingTolerance = sessionTypingTolerance(session, set);
  const result = typingTolerance
    ? evaluateQuestion(item, submittedResponse, { typingTolerance: true })
    : evaluateQuestion(item, submittedResponse);
  const submittedAt = finiteTime(attemptMeta.submittedAt, now);
  const startedAt = finiteTime(attemptMeta.startedAt, submittedAt);
  const scored = isScoredItem(assessmentSet, item);
  const explainAndAccept = assessmentSet?.completionPolicy === EXPLAIN_ACCEPT_POLICY || !scored;
  const revealTypingErrorMap = typingErrorMapEnabled(item);
  const revealAfterAttempt = completionMode
    ? false
    : !result.correct && (revealTypingErrorMap || explainAndAccept || hasSeenAnswer || failedAttemptsBefore + 1 >= 2);
  const gradedTotal = scoredItemCount(assessmentSet);
  const masteryDeltaUnits = masteryDeltaForAttempt({
    assessmentSet,
    masteryMode,
    result,
    attemptNumber,
    itemAttempts
  });
  const appliedMasteryDeltaUnits = scored ? masteryDeltaUnits : 0;
  const masteryBefore = masteryDisplayPercent(session.attempts, gradedTotal);
  const expectedDisplay = expectedResponseDisplay(item);

  const attempt = {
    id: `${session.id}-p${session.promptIndex}-a${attemptNumber}`,
    itemId: item.id,
    questionType: questionTypeForItem(item),
    assessmentMode: assessmentModeForItem(assessmentSet, item),
    masteryMode,
    masteryAchieved: Boolean(result.correct),
    promptIndex: session.promptIndex,
    promptKind: session.currentPromptKind,
    attemptNumber,
    itemAttemptNumber,
    submittedResponse: result.normalizedResponse,
    submittedAnswer: result.displayResponse,
    correct: completionMode ? null : result.correct,
    completed: completionMode ? Boolean(result.correct) : null,
    result: completionMode
      ? (result.correct ? 'completion_success' : 'completion_retry')
      : explainAndAccept && !result.correct
        ? 'explained_incorrect'
        : resolveAttemptResult({ correct: result.correct, hadWrongThisExposure, revealAfterAttempt }),
    masteryDeltaUnits: appliedMasteryDeltaUnits,
    startedAt,
    submittedAt,
    responseDurationMs: Math.max(0, submittedAt - startedAt),
    inputMethod: normalizeInputMethod(attemptMeta.inputMethod),
    pasteDetected: Boolean(attemptMeta.pasteDetected),
    answerRevealedBeforeAttempt: hasSeenAnswer,
    answerRevealedAfterAttempt: completionMode ? false : (revealAfterAttempt || hasSeenAnswer)
  };

  let nextSession = structuredClone(session);
  nextSession.attempts.push(attempt);
  const mastery = masteryDisplayPercent(nextSession.attempts, gradedTotal);
  const masteryDeltaPercent = round2(mastery - masteryBefore);

  if (completionMode && !result.correct) {
    nextSession.retryQueue = queueRetry(nextSession.retryQueue, item.id, session.promptIndex);
    nextSession = queueRapidWarningIfLearning(nextSession, assessmentSet, submittedAt);
    return {
      session: nextSession,
      event: {
        type: 'completion_retry',
        entered: result.displayResponse,
        assessmentMode: attempt.assessmentMode,
        masteryMode,
        attemptNumber,
        masteryDeltaUnits: appliedMasteryDeltaUnits,
        masteryBefore,
        masteryDeltaPercent,
        mastery
      }
    };
  }

  if (!result.correct && explainAndAccept) {
    nextSession = qualifySessionIfEligible(nextSession, set, submittedAt);
    if (nextSession.status !== 'passed') nextSession = advanceLearningPrompt(nextSession, set);
    nextSession = queueRapidWarningIfLearning(nextSession, assessmentSet, submittedAt);
    return {
      session: nextSession,
      event: {
        type: 'explained_incorrect',
        entered: result.displayResponse,
        answer: expectedDisplay,
        assessmentMode: attempt.assessmentMode,
        masteryMode,
        attemptNumber,
        masteryDeltaUnits: appliedMasteryDeltaUnits,
        masteryBefore,
        masteryDeltaPercent,
        mastery,
        passed: nextSession.status === 'passed'
      }
    };
  }

  if (!result.correct) {
    nextSession.retryQueue = queueRetry(nextSession.retryQueue, item.id, session.promptIndex);
    nextSession = qualifySessionIfEligible(nextSession, set, submittedAt);
    if (nextSession.status !== 'passed') nextSession = queueRapidWarningIfLearning(nextSession, assessmentSet, submittedAt);
    return {
      session: nextSession,
      event: {
        type: revealAfterAttempt ? 'incorrect_reveal' : 'incorrect_retry',
        entered: result.displayResponse,
        revealAnswer: revealAfterAttempt ? expectedDisplay : null,
        assessmentMode: attempt.assessmentMode,
        masteryMode,
        attemptNumber,
        masteryDeltaUnits: appliedMasteryDeltaUnits,
        masteryBefore,
        masteryDeltaPercent,
        mastery,
        passed: nextSession.status === 'passed'
      }
    };
  }

  const wasCorrection = completionMode ? false : hadWrongThisExposure;
  nextSession = qualifySessionIfEligible(nextSession, set, submittedAt);
  if (nextSession.status !== 'passed') nextSession = advanceLearningPrompt(nextSession, set);
  nextSession = queueRapidWarningIfLearning(nextSession, assessmentSet, submittedAt);

  return {
    session: nextSession,
    event: {
      type: completionMode ? 'completion_success' : (wasCorrection ? 'correction' : 'retrieval_success'),
      entered: result.displayResponse,
      answer: completionMode ? '' : expectedDisplay,
      assessmentMode: attempt.assessmentMode,
      masteryMode,
      masteryDeltaUnits: appliedMasteryDeltaUnits,
      masteryBefore,
      masteryDeltaPercent,
      mastery,
      passed: nextSession.status === 'passed'
    }
  };
}

export function qualifySessionIfEligible(session, set, now = Date.now()) {
  if (session?.status !== 'active') return session;
  const assessmentSet = assessmentSetForSession(session, set);
  const threshold = sessionPassThreshold(session, set);
  const gradedTotal = scoredItemCount(assessmentSet);
  const completionSatisfied = completionPolicySatisfied(session, assessmentSet);
  const masteryExact = masteryPercentFromAttempts(session.attempts, gradedTotal);
  const masteryQualified = completionSatisfied && (
    gradedTotal === 0
    || assessmentSet?.completionPolicy === EXPLAIN_ACCEPT_POLICY
    || masteryExact >= threshold
  );
  const effort = effortQualification(session, set, now);
  if (!masteryQualified && !effort.reached) return session;

  const qualificationReason = masteryQualified ? 'mastery' : 'effort';
  const qualifiedAt = qualificationReason === 'effort'
    ? now
    : assessmentSet?.assessmentPolicy === WORKBOOK_ALL_ITEMS_ASSESSMENT
      ? lastAttemptTimestamp(session.attempts)
      : assessmentSet?.completionPolicy === EXPLAIN_ACCEPT_POLICY || gradedTotal === 0
        ? lastAttemptTimestamp(session.attempts)
        : firstQualificationTimestamp(session.attempts, gradedTotal, threshold);

  return {
    ...session,
    status: 'passed',
    qualifiedAt: session.qualifiedAt ?? qualifiedAt,
    qualificationReason: session.qualificationReason ?? qualificationReason,
    effortMsAtQualification: session.effortMsAtQualification
      ?? (qualificationReason === 'effort' ? effort.elapsedMs : null)
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
  const assessmentSet = assessmentSetForSession(session, set);
  const gradedTotal = scoredItemCount(assessmentSet);
  const masteryExact = masteryPercentFromAttempts(attempts, gradedTotal);
  const mastery = masteryDisplayPercent(attempts, gradedTotal);
  const accuracyAttempts = attempts.filter(attempt => attempt.assessmentMode !== 'unscored' && attempt.masteryMode !== MASTERY_MODE_COMPLETION);
  const counts = getMasteryCounts(accuracyAttempts);
  const completedMainIds = new Set(
    attempts.filter(attempt => attempt.promptKind === 'main' && (
      attemptSucceeded(attempt)
      || attempt.assessmentMode === 'unscored'
      || (assessmentSet?.completionPolicy === EXPLAIN_ACCEPT_POLICY && attempt.answerRevealedAfterAttempt)
    )).map(attempt => attempt.itemId)
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
  const effort = effortQualification(session, set, now);
  const masteryUnitsEarned = clampUnitCount(
    attempts.reduce((total, attempt) => total + Number(attempt.masteryDeltaUnits ?? 0), 0),
    gradedTotal
  );
  const accuracyItems = (assessmentSet.items ?? []).filter(item => isScoredItem(assessmentSet, item) && masteryModeForItem(assessmentSet, item) !== MASTERY_MODE_COMPLETION);
  const completionItems = (assessmentSet.items ?? []).filter(item => isScoredItem(assessmentSet, item) && masteryModeForItem(assessmentSet, item) === MASTERY_MODE_COMPLETION);
  const accuracyEarned = earnedItemCount(attempts, new Set(accuracyItems.map(item => item.id)));
  const completionEarned = earnedItemCount(attempts, new Set(completionItems.map(item => item.id)));

  return {
    total: set.items.length,
    gradedTotal,
    unscoredTotal: Math.max(0, set.items.length - gradedTotal),
    masteryTotal: gradedTotal,
    masteryEarned: masteryUnitsEarned,
    accuracyTotal: accuracyItems.length,
    accuracyEarned,
    completionTotal: completionItems.length,
    completionEarned,
    completedMainItems: completedMainIds.size,
    mainComplete: completedMainIds.size >= set.items.length,
    totalAttempts: attempts.length,
    retrievalSuccesses: counts.gains,
    retrievalErrors: counts.losses,
    completionCredits: completionEarned,
    corrections: correctedPromptIds.size,
    revealedCount: revealedPromptIds.size,
    retryCount: retryPromptIds.size,
    mastery,
    masteryExact,
    masteryUnit: masteryUnitPercent(gradedTotal),
    passThreshold,
    masteryThresholdReached: gradedTotal === 0 || masteryExact >= passThreshold,
    effortPassEnabled: effort.enabled,
    effortTargetMinutes: effort.minutes,
    effortTargetMs: effort.targetMs,
    effortActiveMs: effort.elapsedMs,
    effortThresholdReached: effort.reached,
    thresholdReached: Boolean(qualifiedAt) || gradedTotal === 0 || masteryExact >= passThreshold || effort.reached,
    qualifiedAt,
    qualificationReason: session.qualificationReason ?? (qualifiedAt ? 'mastery' : null),
    effortMsAtQualification: session.effortMsAtQualification ?? null,
    masteryAtQualification: qualifiedAt ? masteryPercentFromAttempts(attemptsAtQualification, gradedTotal) : null,
    extendedPractice,
    extendedPracticeStartedAt: session.extendedPracticeStartedAt ?? null,
    extendedPracticeDurationMs: extendedPractice && extraPracticeEnd ? Math.max(0, extraPracticeEnd - session.extendedPracticeStartedAt) : 0,
    extendedAttempts: extendedPractice ? attempts.filter(attempt => attempt.submittedAt >= session.extendedPracticeStartedAt).length : 0,
    passed: ['passed', 'extended', 'submitted'].includes(session.status) || Boolean(qualifiedAt),
    submitted: session.status === 'submitted',
    abandoned: session.status === 'abandoned',
    durationMs: Math.max(0, (session.completedAt ?? now) - session.startedAt)
  };
}

function queueRapidWarningIfLearning(session, set, now) {
  if (!['active', 'extended'].includes(session?.status)) return session;
  const warning = rapidWarningForAttempts(session.attempts, set);
  if (!warning) return session;
  return queueIntegrityWarning(session, {
    ...warning,
    occurredAt: now
  }, now);
}

function completionPolicySatisfied(session, set) {
  if (!['all-items', EXPLAIN_ACCEPT_POLICY].includes(set?.completionPolicy)) return true;
  const totalItems = Array.isArray(set?.items) ? set.items.length : 0;
  return totalItems > 0 && Number(session?.mainCursor ?? 0) >= totalItems;
}

function firstQualificationTimestamp(attempts, totalItems, threshold) {
  const transitions = getMasteryTransitions(attempts, totalItems);
  let mastery = 0;
  for (let index = 0; index < transitions.length; index += 1) {
    mastery = transitions[index].after;
    if (mastery >= threshold) {
      const timestamp = Number(attempts[index]?.submittedAt);
      return Number.isFinite(timestamp) ? timestamp : null;
    }
  }
  return null;
}

function attemptSucceeded(attempt) {
  if (typeof attempt?.masteryAchieved === 'boolean') return attempt.masteryAchieved;
  if (attempt?.masteryMode === MASTERY_MODE_COMPLETION) return attempt.completed === true;
  return attempt?.correct === true;
}

function attemptFailed(attempt) {
  if (typeof attempt?.masteryAchieved === 'boolean') return !attempt.masteryAchieved;
  if (attempt?.masteryMode === MASTERY_MODE_COMPLETION) return attempt.completed === false;
  return attempt?.correct === false;
}

function earnedItemCount(attempts, itemIds) {
  const earned = new Set();
  for (const attempt of attempts) {
    if (!itemIds.has(attempt.itemId)) continue;
    if (Number(attempt.masteryDeltaUnits ?? 0) > 0) earned.add(attempt.itemId);
  }
  return earned.size;
}

function clampUnitCount(value, total) {
  return Math.min(Math.max(Number(value) || 0, 0), Math.max(Number(total) || 0, 0));
}

function lastAttemptTimestamp(attempts) {
  const timestamp = Number((attempts ?? []).at(-1)?.submittedAt);
  return Number.isFinite(timestamp) ? timestamp : Date.now();
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
