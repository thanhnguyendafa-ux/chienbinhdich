const WARNING_TYPES = new Set(['paste', 'copy', 'tab_switch']);

export function createIntegrityState({ now = Date.now(), scope = 'full' } = {}) {
  const normalizedScope = scope === 'partial' ? 'partial' : 'full';
  return {
    trackingVersion: 1,
    trackingStartedAt: now,
    trackingScope: normalizedScope,
    pasteCount: 0,
    copyCount: 0,
    tabSwitchCount: 0,
    tabAwayMs: 0,
    hiddenAt: null,
    tabEvents: [],
    warningVersion: 1,
    warningTrackingStartedAt: now,
    warningTrackingScope: normalizedScope,
    warningQueue: [],
    acknowledgements: []
  };
}

export function normalizeIntegrityState(value) {
  if (!value || typeof value !== 'object') return null;
  const warningAvailable = Number(value.warningVersion ?? 0) >= 1;
  return {
    trackingVersion: Number(value.trackingVersion ?? 1),
    trackingStartedAt: finiteOrNull(value.trackingStartedAt),
    trackingScope: value.trackingScope === 'partial' ? 'partial' : 'full',
    pasteCount: nonNegative(value.pasteCount),
    copyCount: nonNegative(value.copyCount),
    tabSwitchCount: nonNegative(value.tabSwitchCount),
    tabAwayMs: nonNegative(value.tabAwayMs),
    hiddenAt: finiteOrNull(value.hiddenAt),
    tabEvents: Array.isArray(value.tabEvents) ? value.tabEvents.map(normalizeTabEvent).filter(Boolean) : [],
    warningVersion: warningAvailable ? Number(value.warningVersion) : null,
    warningTrackingStartedAt: warningAvailable ? finiteOrNull(value.warningTrackingStartedAt) : null,
    warningTrackingScope: warningAvailable ? (value.warningTrackingScope === 'partial' ? 'partial' : 'full') : 'none',
    warningQueue: warningAvailable && Array.isArray(value.warningQueue) ? value.warningQueue.map(normalizeWarning).filter(Boolean) : [],
    acknowledgements: warningAvailable && Array.isArray(value.acknowledgements) ? value.acknowledgements.map(normalizeAcknowledgement).filter(Boolean) : []
  };
}

export function ensureIntegrityState(session, now = Date.now()) {
  const existing = normalizeIntegrityState(session?.integrity);
  if (existing) {
    if (existing.warningVersion === null && isTrackable(session)) {
      return {
        ...existing,
        warningVersion: 1,
        warningTrackingStartedAt: now,
        warningTrackingScope: 'partial',
        warningQueue: [],
        acknowledgements: []
      };
    }
    return existing;
  }
  const partial = Array.isArray(session?.attempts) && session.attempts.length > 0;
  return createIntegrityState({ now, scope: partial ? 'partial' : 'full' });
}

export function recordPaste(session, now = Date.now()) {
  if (!isTrackable(session)) return session;
  const current = ensureIntegrityState(session, now);
  return { ...session, integrity: { ...current, pasteCount: current.pasteCount + 1 } };
}

export function recordCopy(session, now = Date.now()) {
  if (!isTrackable(session)) return session;
  const current = ensureIntegrityState(session, now);
  return { ...session, integrity: { ...current, copyCount: current.copyCount + 1 } };
}

export function recordTabHidden(session, now = Date.now()) {
  if (!isTrackable(session)) return session;
  const current = ensureIntegrityState(session, now);
  if (current.hiddenAt !== null) return session;
  return {
    ...session,
    integrity: {
      ...current,
      tabSwitchCount: current.tabSwitchCount + 1,
      hiddenAt: now,
      tabEvents: [...current.tabEvents, { type: 'hidden', at: now }]
    }
  };
}

export function recordTabVisible(session, now = Date.now()) {
  if (!session) return session;
  const current = normalizeIntegrityState(session.integrity);
  if (!current || current.hiddenAt === null) return session;
  const awayMs = Math.max(0, now - current.hiddenAt);
  return {
    ...session,
    integrity: {
      ...current,
      tabAwayMs: current.tabAwayMs + awayMs,
      hiddenAt: null,
      tabEvents: [...current.tabEvents, { type: 'visible', at: now, awayMs }]
    }
  };
}

export function queueIntegrityWarning(session, warning, now = Date.now()) {
  if (!isTrackable(session) || !WARNING_TYPES.has(warning?.type)) return session;
  const current = ensureIntegrityState(session, now);
  const occurredAt = finiteOrNull(warning.occurredAt) ?? now;
  const occurrenceNumber = Math.max(1, nonNegative(warning.occurrenceNumber));
  const id = String(warning.id ?? `iw-${warning.type}-${occurredAt}-${occurrenceNumber}`);
  if (current.warningQueue.some(item => item.id === id) || current.acknowledgements.some(item => item.id === id)) return session;
  const queued = {
    id,
    type: warning.type,
    occurredAt,
    occurrenceNumber,
    shownAt: null
  };
  if (warning.type === 'tab_switch') queued.awayMs = nonNegative(warning.awayMs);
  return { ...session, integrity: { ...current, warningQueue: [...current.warningQueue, queued] } };
}

export function markIntegrityWarningShown(session, warningId, now = Date.now()) {
  if (!isTrackable(session)) return session;
  const current = ensureIntegrityState(session, now);
  let changed = false;
  const warningQueue = current.warningQueue.map(warning => {
    if (warning.id !== warningId || warning.shownAt !== null) return warning;
    changed = true;
    return { ...warning, shownAt: now };
  });
  return changed ? { ...session, integrity: { ...current, warningQueue } } : session;
}

export function acknowledgeIntegrityWarning(session, warningId, now = Date.now()) {
  if (!isTrackable(session)) return session;
  const current = ensureIntegrityState(session, now);
  const warning = current.warningQueue.find(item => item.id === warningId);
  if (!warning) return session;
  const acknowledgement = {
    ...warning,
    shownAt: warning.shownAt ?? now,
    acknowledgedAt: now
  };
  return {
    ...session,
    integrity: {
      ...current,
      warningQueue: current.warningQueue.filter(item => item.id !== warningId),
      acknowledgements: [...current.acknowledgements, acknowledgement]
    }
  };
}

export function getPendingIntegrityWarnings(session) {
  const current = normalizeIntegrityState(session?.integrity);
  return current?.warningVersion ? current.warningQueue : [];
}

export function finalizeIntegrityState(session, now = Date.now()) {
  const current = normalizeIntegrityState(session?.integrity);
  if (!current || current.hiddenAt === null) return session;
  return recordTabVisible(session, now);
}

export function deriveIntegritySummary(session, now = Date.now()) {
  const integrity = normalizeIntegrityState(session?.integrity);
  if (!integrity) {
    return unavailableSummary();
  }
  const inProgressAwayMs = integrity.hiddenAt === null ? 0 : Math.max(0, now - integrity.hiddenAt);
  const warningTrackingAvailable = integrity.warningVersion !== null;
  const warnings = warningTrackingAvailable ? [...integrity.acknowledgements, ...integrity.warningQueue] : [];
  const warningCounts = { paste: 0, copy: 0, tabSwitch: 0 };
  for (const warning of warnings) {
    if (warning.type === 'paste') warningCounts.paste += 1;
    if (warning.type === 'copy') warningCounts.copy += 1;
    if (warning.type === 'tab_switch') warningCounts.tabSwitch += 1;
  }
  return {
    trackingAvailable: true,
    trackingScope: integrity.trackingScope,
    trackingStartedAt: integrity.trackingStartedAt,
    pasteCount: integrity.pasteCount,
    copyCount: integrity.copyCount,
    tabSwitchCount: integrity.tabSwitchCount,
    tabAwayMs: integrity.tabAwayMs + inProgressAwayMs,
    tabEvents: integrity.tabEvents,
    warningTrackingAvailable,
    warningTrackingScope: warningTrackingAvailable ? integrity.warningTrackingScope : 'none',
    warningTrackingStartedAt: warningTrackingAvailable ? integrity.warningTrackingStartedAt : null,
    warningShownCount: warningTrackingAvailable ? warnings.filter(warning => warning.shownAt !== null).length : null,
    warningAcknowledgedCount: warningTrackingAvailable ? integrity.acknowledgements.length : null,
    warningPendingCount: warningTrackingAvailable ? integrity.warningQueue.length : null,
    warningCounts: warningTrackingAvailable ? warningCounts : null,
    warningEvents: warningTrackingAvailable ? warnings : []
  };
}

function unavailableSummary() {
  return {
    trackingAvailable: false,
    trackingScope: 'none',
    pasteCount: null,
    copyCount: null,
    tabSwitchCount: null,
    tabAwayMs: null,
    tabEvents: [],
    warningTrackingAvailable: false,
    warningTrackingScope: 'none',
    warningTrackingStartedAt: null,
    warningShownCount: null,
    warningAcknowledgedCount: null,
    warningPendingCount: null,
    warningCounts: null,
    warningEvents: []
  };
}

function isTrackable(session) {
  return Boolean(session && ['active', 'extended'].includes(session.status));
}

function normalizeTabEvent(event) {
  if (!event || !['hidden', 'visible'].includes(event.type)) return null;
  const at = Number(event.at);
  if (!Number.isFinite(at)) return null;
  const normalized = { type: event.type, at };
  if (event.type === 'visible') normalized.awayMs = nonNegative(event.awayMs);
  return normalized;
}

function normalizeWarning(warning) {
  if (!warning || !WARNING_TYPES.has(warning.type)) return null;
  const occurredAt = finiteOrNull(warning.occurredAt);
  if (occurredAt === null || !warning.id) return null;
  const normalized = {
    id: String(warning.id),
    type: warning.type,
    occurredAt,
    occurrenceNumber: Math.max(1, nonNegative(warning.occurrenceNumber)),
    shownAt: finiteOrNull(warning.shownAt)
  };
  if (warning.type === 'tab_switch') normalized.awayMs = nonNegative(warning.awayMs);
  return normalized;
}

function normalizeAcknowledgement(warning) {
  const normalized = normalizeWarning(warning);
  if (!normalized) return null;
  const acknowledgedAt = finiteOrNull(warning.acknowledgedAt);
  if (acknowledgedAt === null) return null;
  return { ...normalized, shownAt: normalized.shownAt ?? acknowledgedAt, acknowledgedAt };
}

function nonNegative(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function finiteOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
