import { normalizeLessonSlug, parseLegacyAssignmentToken } from '../core/lessonLinks.js';
import { SESSION_SCHEMA_VERSION } from '../core/sessionMachine.js';

const LEGACY_ACTIVE_KEY = 'cbd.activeSession.v7';
const ACTIVE_PREFIX = 'cbd.activeSession.v8.';
const LAST_NAME_KEY = 'cbd.lastStudentName.v1';
const REPORT_PREFIX = 'cbd.report.v7.';
const MIGRATION_PREFIX = 'cbd.firebaseMigration.v1.';

export const browserSessionStore = Object.freeze({
  saveActive(session, accessContext = null) {
    const storage = requireStorage();
    const key = activeKeyFor(session, accessContext);
    storage.setItem(key, JSON.stringify(session));
    storage.setItem(LAST_NAME_KEY, session.studentName);
    removeMatchingLegacyActive(storage, session, accessContext);
  },
  loadActive(accessContext = null) {
    const storage = requireStorage();
    const scope = currentLinkScope() ?? scopeForAccess(accessContext);
    if (!scope) {
      const legacy = safeParse(storage.getItem(LEGACY_ACTIVE_KEY));
      return isCurrentSession(legacy) ? legacy : null;
    }

    const scopedKey = activeKey(scope);
    const scoped = safeParse(storage.getItem(scopedKey));
    if (isCurrentSession(scoped) && sessionMatchesAccess(scoped, accessContext)) return scoped;

    const legacy = safeParse(storage.getItem(LEGACY_ACTIVE_KEY));
    if (!canSafelyMigrateLegacy(legacy, scope, accessContext)) return null;
    storage.setItem(scopedKey, JSON.stringify(legacy));
    storage.removeItem(LEGACY_ACTIVE_KEY);
    return legacy;
  },
  clearActive(sessionOrAccess = null) {
    const storage = requireStorage();
    const scope = currentLinkScope()
      ?? (isCurrentSession(sessionOrAccess) ? scopeForSession(sessionOrAccess) : scopeForAccess(sessionOrAccess));
    storage.removeItem(scope ? activeKey(scope) : LEGACY_ACTIVE_KEY);
    if (sessionOrAccess) removeMatchingLegacyActive(storage, sessionOrAccess, null);
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

function activeKeyFor(session, accessContext) {
  const scope = currentLinkScope() ?? scopeForAccess(accessContext) ?? scopeForSession(session);
  return scope ? activeKey(scope) : LEGACY_ACTIVE_KEY;
}

function activeKey(scope) {
  return `${ACTIVE_PREFIX}${encodeURIComponent(scope)}`;
}

function currentLinkScope() {
  const pathname = globalThis.location?.pathname;
  if (!pathname) return null;
  const match = String(pathname).replace(/\/+$/, '').match(/^\/a\/([^/]+)$/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]).trim();
  const legacy = parseLegacyAssignmentToken(token);
  if (legacy) return `link:${legacy.slug}-${legacy.code}`;
  const slug = normalizeLessonSlug(token);
  return slug ? `link:${slug}` : null;
}

function scopeForSession(session) {
  if (!session) return null;
  if (session.entryMode === 'fixed-link' && session.accessSlug) return `link:${session.accessSlug}`;
  if (session.entryMode === 'legacy-assignment' && session.assignmentId) return `assignment:${session.assignmentId}`;
  if (session.accessSlug) return `link:${session.accessSlug}`;
  if (session.assignmentId) return `assignment:${session.assignmentId}`;
  return session.setId ? `set:${session.setId}` : null;
}

function scopeForAccess(accessContext) {
  if (!accessContext) return null;
  if (accessContext.kind === 'fixed-link' && accessContext.slug) return `link:${accessContext.slug}`;
  if (accessContext.kind === 'legacy-assignment' && accessContext.code && accessContext.slug) {
    return `link:${accessContext.slug}-${String(accessContext.code).toUpperCase()}`;
  }
  if (accessContext.kind === 'legacy-assignment' && accessContext.assignmentId) return `assignment:${accessContext.assignmentId}`;
  return accessContext.setId ? `set:${accessContext.setId}` : null;
}

function sessionMatchesAccess(session, accessContext) {
  if (!isCurrentSession(session)) return false;
  if (!accessContext) return true;
  if (accessContext.setId && session.setId !== accessContext.setId) return false;
  if (accessContext.kind === 'fixed-link') {
    return session.entryMode === 'fixed-link' && session.accessSlug === accessContext.slug;
  }
  if (accessContext.kind === 'legacy-assignment') {
    return session.entryMode === 'legacy-assignment' && session.assignmentId === accessContext.assignmentId;
  }
  return true;
}

function canSafelyMigrateLegacy(session, targetScope, accessContext) {
  if (!isCurrentSession(session)) return false;
  if (accessContext && !sessionMatchesAccess(session, accessContext)) return false;
  if (targetScope.startsWith('link:') && !targetScope.match(/-[A-HJ-NP-Z2-9]{6}$/i)) {
    return session.entryMode === 'fixed-link' && targetScope === `link:${session.accessSlug}`;
  }
  // Old global storage cannot prove which legacy-assignment code created the session.
  // Do not migrate an ambiguous legacy assignment into a different link.
  if (targetScope.startsWith('link:')) return false;
  return scopeForSession(session) === targetScope;
}

function removeMatchingLegacyActive(storage, session, accessContext) {
  const legacy = safeParse(storage.getItem(LEGACY_ACTIVE_KEY));
  if (!isCurrentSession(legacy)) return;
  const scope = currentLinkScope() ?? scopeForAccess(accessContext) ?? scopeForSession(session);
  if (canSafelyMigrateLegacy(legacy, scope ?? '', accessContext) || legacy.id === session?.id) {
    storage.removeItem(LEGACY_ACTIVE_KEY);
  }
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
