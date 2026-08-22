import { firebaseConfig } from '../config/firebaseConfig.js';
import { attachIntegrityTracking, configureIntegrityRuntime, detachIntegrityTracking, finalizeIntegrityTracking } from '../core/integrityRuntime.js';
import { browserSessionStore as browser } from './browserSessionStore.js';
import { createFirebaseSessionRepository } from './firebaseSessionRepository.js';

// Compatibility facade: existing app imports keep working while persistence dual-writes.
// Session/report semantics stay V7 (cbd.report.v7.); cbd.activeSession.v7 is migration-only.
// Active in-progress attempts use scoped cbd.activeSession.v8.* keys so different lesson links cannot overwrite each other.
const pendingSessions = new Map();
let remoteRepository = null;
let remoteReady = false;
let initializationPromise = null;
let flushPromise = null;
let flushRequested = false;
let lastRemoteError = null;
let onlineListenerInstalled = false;

export const localSessionRepository = Object.freeze({
  saveActive(session) {
    attachIntegrityTracking(session);
    browser.saveActive(session);
    enqueueRemote(session);
  },
  loadActive(accessContext = null) {
    const loaded = browser.loadActive(accessContext);
    if (!loaded) {
      detachIntegrityTracking();
      return null;
    }
    return attachIntegrityTracking(loaded);
  },
  clearActive(sessionOrAccess = null) {
    browser.clearActive(sessionOrAccess);
    detachIntegrityTracking();
  },
  suspendIntegrityTracking() {
    detachIntegrityTracking();
  },
  saveReport(session) {
    finalizeIntegrityTracking(session);
    browser.saveReport(session);
    enqueueRemote(session);
  },
  loadReport(sessionId) {
    return browser.loadReport(sessionId);
  },
  getLastStudentName() {
    return browser.getLastStudentName();
  },
  initializeRemotePersistence() {
    return initializeRemotePersistence();
  },
  syncNow() {
    return flushPending();
  },
  getPersistenceStatus() {
    return {
      mode: firebaseConfig.enabled ? 'firebase-with-local-fallback' : 'local-only',
      remoteReady,
      pendingSessions: pendingSessions.size,
      migrationTimestamp: browser.getFirebaseMigrationTimestamp(firebaseConfig.project.projectId),
      lastRemoteError: lastRemoteError ? String(lastRemoteError.message ?? lastRemoteError) : null
    };
  }
});

configureIntegrityRuntime({
  persistSession(trackedSession) {
    if (!trackedSession?.id || !['active', 'extended'].includes(trackedSession.status)) return;
    browser.saveActive(trackedSession);
    enqueueRemote(trackedSession);
  }
});

if (firebaseConfig.enabled) void initializeRemotePersistence();

function enqueueRemote(session) {
  if (!firebaseConfig.enabled || !session?.id) return;
  pendingSessions.set(session.id, structuredClone(session));
  if (!remoteReady) return;
  if (flushPromise) flushRequested = true;
  else void flushPending();
}

async function initializeRemotePersistence() {
  if (!firebaseConfig.enabled) return { mode: 'local-only' };
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      remoteRepository = createFirebaseSessionRepository(firebaseConfig.project);
      const identity = await remoteRepository.initialize();
      remoteReady = true;
      lastRemoteError = null;
      installOnlineRetry();

      for (const session of browser.listPersistedSessions()) {
        pendingSessions.set(session.id, structuredClone(session));
      }
      await flushPending();
      if (pendingSessions.size === 0) {
        browser.markFirebaseMigration(firebaseConfig.project.projectId);
      }

      return { mode: 'firebase-with-local-fallback', ownerUid: identity.uid };
    } catch (error) {
      remoteReady = false;
      lastRemoteError = error;
      installOnlineRetry();
      console.warn('Firebase persistence unavailable; continuing with local fallback.', error);
      return { mode: 'local-fallback', error };
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

async function flushPending() {
  if (!firebaseConfig.enabled || !remoteReady || !remoteRepository) {
    return { synced: 0, pending: pendingSessions.size };
  }
  if (flushPromise) return flushPromise;

  flushPromise = (async () => {
    let synced = 0;
    for (const [sessionId, snapshot] of [...pendingSessions.entries()]) {
      try {
        await remoteRepository.saveSession(snapshot);
        if (pendingSessions.get(sessionId) === snapshot) {
          pendingSessions.delete(sessionId);
        }
        synced += 1;
        lastRemoteError = null;
      } catch (error) {
        lastRemoteError = error;
        console.warn(`Firebase sync failed for session ${sessionId}; local copy is retained.`, error);
      }
    }
    if (pendingSessions.size === 0) {
      browser.markFirebaseMigration(firebaseConfig.project.projectId);
    }
    return { synced, pending: pendingSessions.size };
  })().finally(() => {
    const shouldFlushAgain = flushRequested;
    flushRequested = false;
    flushPromise = null;
    if (shouldFlushAgain && remoteReady) void flushPending();
  });

  return flushPromise;
}

function installOnlineRetry() {
  if (onlineListenerInstalled || typeof window === 'undefined') return;
  onlineListenerInstalled = true;
  window.addEventListener('online', () => {
    if (remoteReady) void flushPending();
    else void initializeRemotePersistence();
  });
}
