import {
  ensureIntegrityState,
  finalizeIntegrityState,
  recordCopy,
  recordPaste,
  recordTabHidden,
  recordTabVisible
} from './integrityTracker.js';

let currentSession = null;
let persist = null;
let installed = false;

export function configureIntegrityRuntime({ persistSession } = {}) {
  if (typeof persistSession === 'function') persist = persistSession;
  installListeners();
}

export function attachIntegrityTracking(session, now = Date.now()) {
  if (!session) return session;
  if (['active', 'extended'].includes(session.status)) {
    session.integrity = ensureIntegrityState(session, now);
    currentSession = session;
  } else if (currentSession?.id === session.id) {
    currentSession = session;
  }
  installListeners();
  return session;
}

export function finalizeIntegrityTracking(session, now = Date.now()) {
  if (!session) return session;
  const finalized = finalizeIntegrityState(session, now);
  if (finalized !== session) Object.assign(session, finalized);
  currentSession = session;
  return session;
}

function installListeners() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('visibilitychange', () => {
    if (!isTracking()) return;
    const next = document.visibilityState === 'hidden'
      ? recordTabHidden(currentSession)
      : recordTabVisible(currentSession);
    commit(next);
  });

  document.addEventListener('paste', event => {
    if (!isTracking() || !isTypingInput(event.target)) return;
    commit(recordPaste(currentSession));
  }, true);

  document.addEventListener('copy', () => {
    if (!isTracking() || !document.querySelector('.drill-page')) return;
    commit(recordCopy(currentSession));
  }, true);
}

function isTracking() {
  return Boolean(currentSession && ['active', 'extended'].includes(currentSession.status));
}

function isTypingInput(target) {
  return Boolean(target && target.id === 'answer-input');
}

function commit(next) {
  if (!next || next === currentSession) return;
  if (currentSession && next.id === currentSession.id) Object.assign(currentSession, next);
  else currentSession = next;
  persist?.(currentSession);
}
