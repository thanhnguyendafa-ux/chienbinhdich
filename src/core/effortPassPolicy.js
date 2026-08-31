export const MIN_EFFORT_PASS_MINUTES = 5;
export const MAX_EFFORT_PASS_MINUTES = 60;
export const DEFAULT_EFFORT_PASS_ENABLED = false;
export const DEFAULT_EFFORT_PASS_MINUTES = 10;

export function isValidEffortPassMinutes(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric)
    && numeric >= MIN_EFFORT_PASS_MINUTES
    && numeric <= MAX_EFFORT_PASS_MINUTES;
}

export function validateEffortPassMinutes(value, label = 'effortPassMinutes') {
  return isValidEffortPassMinutes(value)
    ? []
    : [`${label} phải là số nguyên từ ${MIN_EFFORT_PASS_MINUTES} đến ${MAX_EFFORT_PASS_MINUTES}.`];
}

export function resolveEffortPassPolicy(lesson, setting = null) {
  const defaultEnabled = lesson?.effortPassEnabled === true;
  const defaultMinutes = isValidEffortPassMinutes(lesson?.effortPassMinutes)
    ? Number(lesson.effortPassMinutes)
    : DEFAULT_EFFORT_PASS_MINUTES;
  const hasEnabledOverride = setting?.effortPassEnabled !== undefined;
  const hasMinutesOverride = setting?.effortPassMinutes !== undefined;
  const enabled = hasEnabledOverride ? setting.effortPassEnabled === true : defaultEnabled;
  const minutes = hasMinutesOverride ? Number(setting.effortPassMinutes) : defaultMinutes;

  if (hasEnabledOverride && typeof setting.effortPassEnabled !== 'boolean') {
    throw new Error(`Lesson setting có effortPassEnabled không hợp lệ cho ${lesson?.id ?? '(unknown)'}.`);
  }
  if ((enabled || hasMinutesOverride) && !isValidEffortPassMinutes(minutes)) {
    throw new Error(`Lesson setting có effortPassMinutes không hợp lệ cho ${lesson?.id ?? '(unknown)'}.`);
  }

  return Object.freeze({
    enabled,
    minutes,
    targetMs: minutes * 60_000,
    defaultEnabled,
    defaultMinutes,
    source: hasEnabledOverride || hasMinutesOverride ? 'admin-override' : 'catalog',
    updatedAt: finiteOrNull(setting?.updatedAt),
    updatedBy: setting?.updatedBy ? String(setting.updatedBy) : null
  });
}

export function sessionEffortPassPolicy(session, lesson) {
  const snapshottedEnabled = typeof session?.effortPassEnabledAtStart === 'boolean'
    ? session.effortPassEnabledAtStart
    : null;
  const snapshottedMinutes = isValidEffortPassMinutes(session?.effortTargetMinutesAtStart)
    ? Number(session.effortTargetMinutesAtStart)
    : null;
  if (snapshottedEnabled !== null && (!snapshottedEnabled || snapshottedMinutes !== null)) {
    const minutes = snapshottedMinutes ?? DEFAULT_EFFORT_PASS_MINUTES;
    return Object.freeze({
      enabled: snapshottedEnabled,
      minutes,
      targetMs: minutes * 60_000,
      source: 'session-snapshot'
    });
  }
  const current = lesson?.effortPassPolicy ?? resolveEffortPassPolicy(lesson, null);
  return Object.freeze({
    enabled: current.enabled === true,
    minutes: current.minutes,
    targetMs: current.targetMs,
    source: current.source
  });
}

export function activeStudyMs(session, now = Date.now()) {
  const startedAt = Number(session?.startedAt);
  if (!Number.isFinite(startedAt)) return 0;
  const endAt = Number(session?.completedAt ?? session?.submittedAt ?? now);
  if (!Number.isFinite(endAt)) return 0;
  const integrity = session?.integrity ?? null;
  const recordedAwayMs = nonNegative(integrity?.tabAwayMs);
  const inProgressAwayMs = Number.isFinite(Number(integrity?.hiddenAt))
    ? Math.max(0, Number(now) - Number(integrity.hiddenAt))
    : 0;
  return Math.max(0, endAt - startedAt - recordedAwayMs - inProgressAwayMs);
}

export function effortQualification(session, lesson, now = Date.now()) {
  const policy = sessionEffortPassPolicy(session, lesson);
  const elapsedMs = activeStudyMs(session, now);
  const attempts = Array.isArray(session?.attempts) ? session.attempts : [];
  return Object.freeze({
    ...policy,
    elapsedMs,
    hasAttempt: attempts.length > 0,
    reached: policy.enabled === true && attempts.length > 0 && elapsedMs >= policy.targetMs
  });
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function nonNegative(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}
