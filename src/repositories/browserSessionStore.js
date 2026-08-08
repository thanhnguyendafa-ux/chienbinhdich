import { SESSION_SCHEMA_VERSION } from '../core/sessionMachine.js';

const ACTIVE_KEY = 'cbd.activeSession.v7';
const LAST_NAME_KEY = 'cbd.lastStudentName.v1';
const REPORT_PREFIX = 'cbd.report.v7.';
const MIGRATION_PREFIX = 'cbd.firebaseMigration.v1.';

export const browserSessionStore = Object.freeze({
  saveActive(session) {
    const storage = requireStorage();
    storage.setItem(ACTIVE_KEY, JSON.stringify(session));
    storage.setItem(LAST_NAME_KEY, session.studentName);
  },
  loadActive() {
    const session = safeParse(requireStorage().getItem(ACTIVE_KEY));
    return isCurrentSession(session) ? session : null;
  },
  clearActive() {
    requireStorage().removeItem(ACTIVE_KEY);
  },
  saveReport(session) {
    const storage = requireStorage();
    storage.setItem(`${REPORT_PREFIX}${session.id}`, JSON.stringify(session));
    this.clearActive();
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
    const active = this.loadActive();
    if (active?.id) byId.set(active.id, active);

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(REPORT_PREFIX)) continue;
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
  active: ACTIVE_KEY,
  lastStudentName: LAST_NAME_KEY,
  reportPrefix: REPORT_PREFIX,
  migrationPrefix: MIGRATION_PREFIX
});

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
