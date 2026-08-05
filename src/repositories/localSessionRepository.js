import { SESSION_SCHEMA_VERSION } from '../core/sessionMachine.js';

const ACTIVE_KEY = 'cbd.activeSession.v5';
const LAST_NAME_KEY = 'cbd.lastStudentName.v1';
const REPORT_PREFIX = 'cbd.report.v5.';

export const localSessionRepository = Object.freeze({
  saveActive(session) {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
    localStorage.setItem(LAST_NAME_KEY, session.studentName);
  },
  loadActive() {
    const session = safeParse(localStorage.getItem(ACTIVE_KEY));
    return session?.schemaVersion === SESSION_SCHEMA_VERSION ? session : null;
  },
  clearActive() { localStorage.removeItem(ACTIVE_KEY); },
  saveReport(session) {
    localStorage.setItem(`${REPORT_PREFIX}${session.id}`, JSON.stringify(session));
    this.clearActive();
  },
  loadReport(sessionId) {
    const session = safeParse(localStorage.getItem(`${REPORT_PREFIX}${sessionId}`));
    return session?.schemaVersion === SESSION_SCHEMA_VERSION ? session : null;
  },
  getLastStudentName() { return localStorage.getItem(LAST_NAME_KEY) ?? ''; }
});

function safeParse(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
