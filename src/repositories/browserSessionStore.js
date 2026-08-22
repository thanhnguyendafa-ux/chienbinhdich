import { SESSION_SCHEMA_VERSION } from '../core/sessionMachine.js';

const LEGACY_ACTIVE_KEY = 'cbd.activeSession.v7';
const ACTIVE_PREFIX = 'cbd.activeSession.v8.';
const LAST_NAME_KEY = 'cbd.lastStudentName.v1';
const REPORT_PREFIX = 'cbd.report.v7.';
const MIGRATION_PREFIX = 'cbd.firebaseMigration.v1.';

export const browserSessionStore = Object.freeze({
  saveActive(session) {
    const storage = requireStorage();
    const key = activeKeyForSession(session);
    storage.setItem(key, JSON.stringify(session));
    storage.setItem(LAST_NAME_KEY, session.studentName);
    removeMatchingLegacyActive(storage, session);
  },
  loadActive(accessContext = null) {
    const storage = requireStorage();
    if (!accessContext) {
      const legacy = safeParse(storage.getItem(LEGACY_ACTIVE_KEY));
      return isCurrentSession(legacy) ? legacy : null;
    }

    const scopedKey = activeKeyForAccess(accessContext);
    if (!scopedKey) return null;
    const scoped = safeParse(storage.getItem(scopedKey));
    if (isCurrentSession(scoped) && sessionMatchesAccess(scoped, accessContext)) return scoped;

    const legacy = safeParse(storage.getItem(LEGACY_ACTIVE_KEY));
    if (!isCurrentSession(legacy) || !sessionMatchesAccess(legacy, accessContext)) return null;
    storage.setItem(scopedKey, JSON.stringify(legacy));
    storage.removeItem(LEGACY_ACTIVE_KEY);
    return legacy;
  },
  clearActive(sessionOrAccess = null) {
    const storage = requireStorage();
    const key = sessionOrAccess
      ? (isCurrentSession(sessionOrAccess) ? activeKeyForSession(sessionOrAccess) : activeKeyForAccess(sessionOrAccess))
      : LEGACY_ACTIVE_KEY;
    if (key) storage.removeItem(key);
    if (sessionOrAccess) removeMatchingLegacyActive(storage, sessionOrAccess);
  },
  saveReport(session) {
    const storage = requireStorage();
    storage.setItem(`${REPORT_PREFIX}${session.id}`, JSON.stringify(session));
    this.clearActive(session);
  },
  loadReport(sessionId) {
    const session = safeParse(requireStorage().getItem(`${REPORT_PREFIX}${sessionId}`));
    return isCurrentSession(session) ? session : null;
  },
  getLastStudentName() {
    return requireStorage().getItem(LAST_NAME_KEY) ?? '';
  },
  listPersistedSessions() {
    const storage = requireStorage();
    const byId = new Map();

    const legacy = safeParse(storage.getItem(LEGACY_ACTIVE_KEY));
    if (isCurrentSession(legacy) && legacy.id) byId.set(legacy.id, legacy);

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(ACTIVE_PREFIX) && !key?.startsWith(REPORT_PREFIX)) continue;
      const session = safeParse(storage.getItem(key));
      if (isCurrentSession(session) && session.id) byId.set(session.id, session);
    }

    return [...byId.values()];
  },
  markFirebaseMigration(projectId, now = Date.now()) {
    if (!projectId) return;
    requireStorage().setItem(`${MIGRATION_PREFIX}${projectId}`, String(now));
  },
  getFirebaseMigrationTimestamp(projectId) {
    if (!projectId) return null;
    const value = Number(requireStorage().getItem(`${MIGRATION_PREFIX}${projectId}`));
    return Number.isFinite(value) && value > 0 ? value : null;
  }
});

export const browserSessionKeys = Object.freeze({
  active: LEGACY_ACTIVE_KEY,
  activePrefix: ACTIVE_PREFIX,
  lastStudentName: LAST_NAME_KEY,
  reportPrefix: REPORT_PREFIX,
  migrationPrefix: MIGRATION_PREFIX
});

function activeKeyForSession(session) {
  const scope = scopeForSession(session);
  return scope ? `${ACTIVE_PREFIX}${encodeURIComponent(scope)}` : LEGACY_ACTIVE_KEY;
}

function activeKeyForAccess(accessContext) {
  const scope = scopeForAccess(accessContext);
  return scope ? `${ACTIVE_PREFIX}${encodeURIComponent(scope)}` : null;
}

function scopeForSession(session) {
  if (!session) return null;
  if (session.entryMode === 'fixed-link' && session.accessSlug) return `fixed:${session.accessSlug}`;
  if (session.entryMode === 'legacy-assignment' && session.assignmentId) return `assignment:${session.assignmentId}`;
  if (session.accessSlug) return `fixed:${session.accessSlug}`;
  if (session.assignmentId) return `assignment:${session.assignmentId}`;
  return session.setId ? `set:${session.setId}` : null;
}

function scopeForAccess(accessContext) {
  if (!accessContext) return null;
  if (accessContext.kind === 'fixed-link' && accessContext.slug) return `fixed:${accessContext.slug}`;
  if (accessContext.kind === 'legacy-assignment' && accessContext.assignmentId) return `assignment:${accessContext.assignmentId}`;
  return accessContext.setId ? `set:${accessContext.setId}` : null;
}

function sessionMatchesAccess(session, accessContext) {
  if (!isCurrentSession(session) || !accessContext) return false;
  if (accessContext.setId && session.setId !== accessContext.setId) return false;
  if (accessContext.kind === 'fixed-link') {
    return session.entryMode === 'fixed-link' && session.accessSlug === accessContext.slug;
  }
  if (accessContext.kind === 'legacy-assignment') {
    return session.entryMode === 'legacy-assignment' && session.assignmentId === accessContext.assignmentId;
  }
  return scopeForSession(session) === scopeForAccess(accessContext);
}

function removeMatchingLegacyActive(storage, sessionOrAccess) {
  const legacy = safeParse(storage.getItem(LEGACY_ACTIVE_KEY));
  if (!isCurrentSession(legacy)) return;
  const targetScope = isCurrentSession(sessionOrAccess) ? scopeForSession(sessionOrAccess) : scopeForAccess(sessionOrAccess);
  if (targetScope && scopeForSession(legacy) === targetScope) storage.removeItem(LEGACY_ACTIVE_KEY);
}

function isCurrentSession(session) {
  return session?.schemaVersion === SESSION_SCHEMA_VERSION;
}

function safeParse(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function requireStorage() {
  const storage = globalThis.localStorage;
  if (!storage) throw new Error('localStorage is not available in this browser.');
  return storage;
}
