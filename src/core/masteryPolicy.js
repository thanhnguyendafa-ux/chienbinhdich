export const DEFAULT_PASS_THRESHOLD = 80;
export const MIN_PASS_THRESHOLD = 1;
export const MAX_PASS_THRESHOLD = 100;

export function isValidPassThreshold(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric)
    && numeric >= MIN_PASS_THRESHOLD
    && numeric <= MAX_PASS_THRESHOLD;
}

export function normalizePassThreshold(value, fallback = DEFAULT_PASS_THRESHOLD) {
  if (isValidPassThreshold(value)) return Number(value);
  if (isValidPassThreshold(fallback)) return Number(fallback);
  return DEFAULT_PASS_THRESHOLD;
}

export function validatePassThreshold(value, label = 'passThreshold') {
  return isValidPassThreshold(value)
    ? []
    : [`${label} phải là số nguyên từ ${MIN_PASS_THRESHOLD} đến ${MAX_PASS_THRESHOLD}.`];
}

export function catalogPassThreshold(lesson) {
  return normalizePassThreshold(lesson?.passThreshold, DEFAULT_PASS_THRESHOLD);
}

export function resolveMasteryPolicy(lesson, setting = null) {
  const defaultThreshold = catalogPassThreshold(lesson);
  if (setting === null || setting === undefined) {
    return Object.freeze({
      passThreshold: defaultThreshold,
      defaultThreshold,
      source: 'catalog',
      updatedAt: null,
      updatedBy: null
    });
  }

  if (!isValidPassThreshold(setting.passThreshold)) {
    throw new Error(`Lesson setting có passThreshold không hợp lệ cho ${lesson?.id ?? '(unknown)'}.`);
  }

  return Object.freeze({
    passThreshold: Number(setting.passThreshold),
    defaultThreshold,
    source: 'admin-override',
    updatedAt: finiteOrNull(setting.updatedAt),
    updatedBy: setting.updatedBy ? String(setting.updatedBy) : null
  });
}

export function sessionPassThreshold(session, lesson) {
  if (isValidPassThreshold(session?.passThresholdAtStart)) {
    return Number(session.passThresholdAtStart);
  }

  // Before runtime Mastery settings existed, every Session V7 lesson used 80%.
  // Missing snapshots on legacy V7 sessions therefore resolve deterministically to 80%.
  if (Number(session?.schemaVersion) === 7) return DEFAULT_PASS_THRESHOLD;

  return catalogPassThreshold(lesson);
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
