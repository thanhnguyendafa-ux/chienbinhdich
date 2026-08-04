const ACTIVE_KEY = 'cbd.activeSession.v1';
const LAST_NAME_KEY = 'cbd.lastStudentName.v1';
const REPORT_PREFIX = 'cbd.report.v1.';

export const localSessionRepository = Object.freeze({
  saveActive(session) {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
    localStorage.setItem(LAST_NAME_KEY, session.studentName);
  },
  loadActive() { return safeParse(localStorage.getItem(ACTIVE_KEY)); },
  clearActive() { localStorage.removeItem(ACTIVE_KEY); },
  saveReport(session) {
    localStorage.setItem(`${REPORT_PREFIX}${session.id}`, JSON.stringify(session));
    this.clearActive();
  },
  loadReport(sessionId) { return safeParse(localStorage.getItem(`${REPORT_PREFIX}${sessionId}`)); },
  getLastStudentName() { return localStorage.getItem(LAST_NAME_KEY) ?? ''; }
});
function safeParse(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
