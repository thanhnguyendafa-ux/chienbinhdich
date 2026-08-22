import {
  acknowledgeIntegrityWarning,
  ensureIntegrityState,
  finalizeIntegrityState,
  getPendingIntegrityWarnings,
  markIntegrityWarningShown,
  queueIntegrityWarning,
  recordCopy,
  recordPaste,
  recordTabHidden,
  recordTabVisible
} from './integrityTracker.js';

let currentSession = null;
let persist = null;
let installed = false;
const warningListeners = new Set();

export function configureIntegrityRuntime({ persistSession } = {}) {
  if (typeof persistSession === 'function') persist = persistSession;
  installListeners();
}

export function attachIntegrityTracking(session, now = Date.now()) {
  if (!session) return session;
  if (['active', 'extended'].includes(session.status)) {
    session.integrity = ensureIntegrityState(session, now);
    if (typeof document !== 'undefined' && document.visibilityState !== 'hidden' && session.integrity.hiddenAt !== null) {
      const hiddenAt = session.integrity.hiddenAt;
      let recovered = recordTabVisible(session, now);
      recovered = queueIntegrityWarning(recovered, {
        type: 'tab_switch',
        occurredAt: hiddenAt,
        occurrenceNumber: recovered.integrity.tabSwitchCount,
        awayMs: Math.max(0, now - hiddenAt)
      }, now);
      Object.assign(session, recovered);
    }
    currentSession = session;
  } else if (currentSession?.id === session.id) {
    currentSession = session;
  }
  installListeners();
  scheduleWarningNotification();
  return session;
}

export function detachIntegrityTracking() {
  currentSession = null;
  scheduleWarningNotification();
}

export function finalizeIntegrityTracking(session, now = Date.now()) {
  if (!session) return session;
  const finalized = finalizeIntegrityState(session, now);
  if (finalized !== session) Object.assign(session, finalized);
  currentSession = session;
  return session;
}

export function subscribeIntegrityWarnings(listener) {
  if (typeof listener !== 'function') return () => {};
  warningListeners.add(listener);
  scheduleWarningNotification();
  return () => warningListeners.delete(listener);
}

export function markCurrentIntegrityWarningShown(warningId, now = Date.now()) {
  if (!isTracking()) return [];
  commit(markIntegrityWarningShown(currentSession, warningId, now));
  notifyWarnings();
  return getPendingIntegrityWarnings(currentSession);
}

export function acknowledgeCurrentIntegrityWarning(warningId, now = Date.now()) {
  if (!isTracking()) return [];
  commit(acknowledgeIntegrityWarning(currentSession, warningId, now));
  notifyWarnings();
  return getPendingIntegrityWarnings(currentSession);
}

function installListeners() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('visibilitychange', () => {
    if (!isTracking()) return;
    if (document.visibilityState === 'hidden') {
      commit(recordTabHidden(currentSession));
      return;
    }

    const hiddenAt = currentSession?.integrity?.hiddenAt;
    if (hiddenAt === null || hiddenAt === undefined) return;
    const now = Date.now();
    let next = recordTabVisible(currentSession, now);
    next = queueIntegrityWarning(next, {
      type: 'tab_switch',
      occurredAt: hiddenAt,
      occurrenceNumber: next.integrity.tabSwitchCount,
      awayMs: Math.max(0, now - hiddenAt)
    }, now);
    commit(next);
    scheduleWarningNotification();
  });

  document.addEventListener('paste', event => {
    if (!isTracking() || !isTypingInput(event.target) || isInsideIntegrityDialog(event.target)) return;
    const now = Date.now();
    let next = recordPaste(currentSession, now);
    next = queueIntegrityWarning(next, {
      type: 'paste',
      occurredAt: now,
      occurrenceNumber: next.integrity.pasteCount
    }, now);
    commit(next);
    scheduleWarningNotification();
  }, true);

  document.addEventListener('copy', event => {
    if (!isTracking() || !document.querySelector('.drill-page') || isInsideIntegrityDialog(event.target) || selectionInsideIntegrityDialog() || !hasCopySelection(event.target)) return;
    const now = Date.now();
    let next = recordCopy(currentSession, now);
    next = queueIntegrityWarning(next, {
      type: 'copy',
      occurredAt: now,
      occurrenceNumber: next.integrity.copyCount
    }, now);
    commit(next);
    scheduleWarningNotification();
  }, true);
}

function isTracking() {
  return Boolean(currentSession && ['active', 'extended'].includes(currentSession.status));
}

function isTypingInput(target) {
  return Boolean(target && target.id === 'answer-input');
}

function hasCopySelection(target) {
  if (target && typeof target.selectionStart === 'number' && typeof target.selectionEnd === 'number') {
    return target.selectionEnd > target.selectionStart;
  }
  const selection = typeof document !== 'undefined' ? document.getSelection?.() : null;
  return Boolean(selection && String(selection).trim().length > 0);
}

function isInsideIntegrityDialog(target) {
  return Boolean(target?.closest?.('#integrity-warning-dialog'));
}

function selectionInsideIntegrityDialog() {
  if (typeof document === 'undefined') return false;
  const dialog = document.querySelector('#integrity-warning-dialog');
  const selection = document.getSelection?.();
  if (!dialog || !selection?.anchorNode) return false;
  const anchor = selection.anchorNode.nodeType === 1 ? selection.anchorNode : selection.anchorNode.parentElement;
  return Boolean(anchor && dialog.contains(anchor));
}

function commit(next) {
  if (!next || next === currentSession) return;
  if (currentSession && next.id === currentSession.id) Object.assign(currentSession, next);
  else currentSession = next;
  persist?.(currentSession);
}

function scheduleWarningNotification() {
  if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
    window.setTimeout(notifyWarnings, 0);
  } else {
    notifyWarnings();
  }
}

function notifyWarnings() {
  const warnings = currentSession ? getPendingIntegrityWarnings(currentSession) : [];
  for (const listener of warningListeners) listener(warnings);
}
