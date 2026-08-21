export function createIntegrityState() {
  return {
    trackingVersion: 1,
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
    tabSwitchCount: Math.max(0, Number(value.tabSwitchCount ?? 0)),
    tabAwayMs: Math.max(0, Number(value.tabAwayMs ?? 0)),
    hiddenAt: Number.isFinite(Number(value.hiddenAt)) ? Number(value.hiddenAt) : null,
    tabEvents: Array.isArray(value.tabEvents) ? value.tabEvents.map(normalizeTabEvent).filter(Boolean) : []
  };
}

export function recordTabHidden(session, now = Date.now()) {
  if (!session || !['active', 'extended'].includes(session.status)) return session;
  const current = normalizeIntegrityState(session.integrity) ?? createIntegrityState();
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
  if (!session) return session;
  const current = normalizeIntegrityState(session.integrity);
  if (!current || current.hiddenAt === null) return session;
  return recordTabVisible(session, now);
}

export function deriveIntegritySummary(session) {
  const integrity = normalizeIntegrityState(session?.integrity);
  if (!integrity) {
    return {
      trackingAvailable: false,
      tabSwitchCount: null,
      tabAwayMs: null,
      tabEvents: []
    };
  }
  const inProgressAwayMs = integrity.hiddenAt === null ? 0 : Math.max(0, Date.now() - integrity.hiddenAt);
  return {
    trackingAvailable: true,
    tabSwitchCount: integrity.tabSwitchCount,
    tabAwayMs: integrity.tabAwayMs + inProgressAwayMs,
    tabEvents: integrity.tabEvents
  };
}

function normalizeTabEvent(event) {
  if (!event || !['hidden', 'visible'].includes(event.type)) return null;
  const at = Number(event.at);
  if (!Number.isFinite(at)) return null;
  const normalized = { type: event.type, at };
  if (event.type === 'visible') normalized.awayMs = Math.max(0, Number(event.awayMs ?? 0));
  return normalized;
}
