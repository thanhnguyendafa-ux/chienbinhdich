export function getFirstTryCorrectCount(attempts = []) {
  return attempts.filter(attempt => attempt.attemptNumber === 1 && attempt.correct).length;
}

export function scorePercentFromAttempts(attempts, totalItems) {
  if (!totalItems) return 0;
  return Math.round((getFirstTryCorrectCount(attempts) / totalItems) * 100);
}

export function hasPassedScore(attempts, totalItems, threshold = 80) {
  return scorePercentFromAttempts(attempts, totalItems) >= threshold;
}
