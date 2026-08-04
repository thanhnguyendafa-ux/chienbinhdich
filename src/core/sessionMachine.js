import { evaluateAnswer } from './answerEvaluator.js';
import { hasPassed, scorePercent } from './scoreEngine.js';

export function createSession({ studentName, set, now = Date.now() }) {
  return {
    id: createSessionId(now), studentName: studentName.trim(), setId: set.id,
    startedAt: now, completedAt: null, currentIndex: 0, firstTryCorrect: 0,
    attempts: [],
    itemStates: Object.fromEntries(set.items.map(item => [item.id, { attempts: 0, corrected: false, firstTryCorrect: false }])),
    status: 'in_progress'
  };
}

export function submitAnswer({ session, set, answer, now = Date.now() }) {
  const item = set.items[session.currentIndex];
  if (!item) return { session, event: { type: 'finished' } };
  const itemState = session.itemStates[item.id];
  const result = evaluateAnswer(answer, item.en);
  const isFirstAttempt = itemState.attempts === 0;
  const nextSession = structuredClone(session);
  const nextState = nextSession.itemStates[item.id];
  nextState.attempts += 1;
  nextSession.attempts.push({ itemId: item.id, answer: result.normalizedInput, correct: result.correct, firstAttempt: isFirstAttempt, at: now });

  if (!result.correct) {
    return { session: nextSession, event: { type: 'incorrect', entered: result.normalizedInput } };
  }

  if (isFirstAttempt) {
    nextState.firstTryCorrect = true;
    nextSession.firstTryCorrect += 1;
  } else {
    nextState.corrected = true;
  }

  nextSession.currentIndex += 1;
  const completed = nextSession.currentIndex >= set.items.length;
  if (completed) {
    nextSession.completedAt = now;
    nextSession.status = 'completed';
  }

  return {
    session: nextSession,
    event: {
      type: isFirstAttempt ? 'correct_first_try' : 'corrected',
      completed,
      score: scorePercent(nextSession.firstTryCorrect, set.items.length),
      passed: completed ? hasPassed(nextSession.firstTryCorrect, set.items.length, set.passThreshold) : false
    }
  };
}

export function getSessionMetrics(session, set) {
  const total = set.items.length;
  const score = scorePercent(session.firstTryCorrect, total);
  return {
    total,
    completedItems: Math.min(session.currentIndex, total),
    firstTryCorrect: session.firstTryCorrect,
    correctedCount: Object.values(session.itemStates).filter(item => item.corrected).length,
    score,
    passed: session.status === 'completed' && score >= set.passThreshold,
    durationMs: (session.completedAt ?? Date.now()) - session.startedAt
  };
}

function createSessionId(now) {
  const timePart = now.toString(36).slice(-4).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MRT-${timePart}${randomPart}`;
}
