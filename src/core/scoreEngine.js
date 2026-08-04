export function scorePercent(firstTryCorrect, totalItems) {
  if (!totalItems) return 0;
  return Math.round((firstTryCorrect / totalItems) * 100);
}
export function hasPassed(firstTryCorrect, totalItems, threshold = 80) {
  return scorePercent(firstTryCorrect, totalItems) >= threshold;
}
