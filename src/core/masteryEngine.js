export function masteryUnitPercent(totalItems) {
  return totalItems > 0 ? 100 / totalItems : 0;
}

export function masteryUnitsFromAttempts(attempts = []) {
  return attempts.reduce((total, attempt) => total + normalizeDelta(attempt.masteryDeltaUnits), 0);
}

export function masteryPercentFromAttempts(attempts = [], totalItems = 0) {
  const unit = masteryUnitPercent(totalItems);
  let mastery = 0;

  for (const attempt of attempts) {
    mastery = clamp(mastery + normalizeDelta(attempt.masteryDeltaUnits) * unit, 0, 100);
  }

  return round2(mastery);
}

export function masteryDisplayPercent(attempts = [], totalItems = 0) {
  return masteryPercentFromAttempts(attempts, totalItems);
}

export function hasReachedMastery(attempts = [], totalItems = 0, threshold = 80) {
  return masteryPercentFromAttempts(attempts, totalItems) >= threshold;
}

export function getMasteryTransitions(attempts = [], totalItems = 0) {
  const unit = masteryUnitPercent(totalItems);
  let mastery = 0;

  return attempts.map(attempt => {
    const before = mastery;
    mastery = clamp(mastery + normalizeDelta(attempt.masteryDeltaUnits) * unit, 0, 100);
    return {
      before: round2(before),
      after: round2(mastery),
      delta: round2(mastery - before)
    };
  });
}

export function getItemMasteryUnits(attempts = [], itemId) {
  return attempts
    .filter(attempt => attempt.itemId === itemId)
    .reduce((total, attempt) => total + normalizeDelta(attempt.masteryDeltaUnits), 0);
}

export function getMasteryCounts(attempts = []) {
  let gains = 0;
  let losses = 0;
  let neutral = 0;

  for (const attempt of attempts) {
    const delta = normalizeDelta(attempt.masteryDeltaUnits);
    if (delta > 0) gains += 1;
    else if (delta < 0) losses += 1;
    else neutral += 1;
  }

  return { gains, losses, neutral };
}

function normalizeDelta(value) {
  if (value === 1 || value === -1) return value;
  return 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
