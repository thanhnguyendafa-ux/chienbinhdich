export const DEFAULT_TYPING_TOLERANCE = false;

export function isValidTypingTolerance(value) {
  return typeof value === 'boolean';
}

export function catalogTypingTolerance(lesson) {
  return isValidTypingTolerance(lesson?.typingTolerance)
    ? lesson.typingTolerance
    : DEFAULT_TYPING_TOLERANCE;
}

export function resolveTypingPolicy(lesson, setting = null) {
  const defaultTolerance = catalogTypingTolerance(lesson);
  const hasOverride = isValidTypingTolerance(setting?.typingTolerance);
  return Object.freeze({
    typingTolerance: hasOverride ? setting.typingTolerance : defaultTolerance,
    defaultTolerance,
    source: hasOverride ? 'admin-override' : 'catalog',
    updatedAt: hasOverride ? finiteOrNull(setting?.updatedAt) : null,
    updatedBy: hasOverride && setting?.updatedBy ? String(setting.updatedBy) : null
  });
}

export function sessionTypingTolerance(session, lesson) {
  if (isValidTypingTolerance(session?.typingToleranceAtStart)) {
    return session.typingToleranceAtStart;
  }

  // Typing tolerance did not exist for legacy Session V7 data, so missing snapshots
  // must remain strict to preserve the grading contract those sessions started with.
  if (Number(session?.schemaVersion) === 7) return DEFAULT_TYPING_TOLERANCE;

  return catalogTypingTolerance(lesson);
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
