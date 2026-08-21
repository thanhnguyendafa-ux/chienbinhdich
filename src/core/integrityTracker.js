export function createIntegrityState({ now = Date.now(), scope = 'full' } = {}) {
  return {
    trackingVersion: 1,
    trackingStartedAt: now,
    trackingScope: scope === 'partial' ? 'partial' : 'full',
    pasteCount: 0,
    copyCount: 0,
    tabSwitchCount: 0,
    tabAwayMs: 0,
    hiddenAt: null,
    tabEvents: []
  };
}

export function normalizeIntegrityState(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    trackingVersion: Number(value.trackingVersion ?? 1),
    trackingStartedAt: finiteOrNull(value.trackingStartedAt),
    trackingScope: value.trackingScope === 'partial' ? 'partial' : 'full',
    pasteCount: nonNegative(value.pasteCount),
    copyCount: nonNegative(value.copyCount),
    tabSwitchCount: nonNegative(value.tabSwitchCount),
    tabAwayMs: nonNegative(value.tabAwayMs),
    hiddenAt: finiteOrNull(value.hiddenAt),
    tabEvents: Array.isArray(value.tabEvents) ? value.tabEvents.map(normalizeTabEvent).filter(Boolean) : []
  };
}

export function ensureIntegrityState(session, now = Date.now()) {
  const existing = normalizeIntegrityState(session?.integrity);
  if (existing) return existing;
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

export function finalizeIntegrityState(session, now = Date.now()) {
  const current = normalizeIntegrityState(session?.integrity);
  if (!current || current.hiddenAt === null) return session;
  return recordTabVisible(session, now);
}

export function deriveIntegritySummary(session, now = Date.now()) {
  const integrity = normalizeIntegrityState(session?.integrity);
  if (!integrity) {
    return {
      trackingAvailable: false,
      trackingScope: 'none',
      pasteCount: null,
      copyCount: null,
      tabSwitchCount: null,
      tabAwayMs: null,
      tabEvents: []
    };
  }
  const inProgressAwayMs = integrity.hiddenAt === null ? 0 : Math.max(0, now - integrity.hiddenAt);
  return {
    trackingAvailable: true,
    trackingScope: integrity.trackingScope,
    trackingStartedAt: integrity.trackingStartedAt,
    pasteCount: integrity.pasteCount,
    copyCount: integrity.copyCount,
    tabSwitchCount: integrity.tabSwitchCount,
    tabAwayMs: integrity.tabAwayMs + inProgressAwayMs,
    tabEvents: integrity.tabEvents
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

function nonNegative(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
