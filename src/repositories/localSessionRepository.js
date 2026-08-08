import { firebaseConfig } from '../config/firebaseConfig.js';
import { browserSessionStore as browser } from './browserSessionStore.js';
import { createFirebaseSessionRepository } from './firebaseSessionRepository.js';

// Compatibility facade: existing app imports keep working while persistence dual-writes.
// Legacy keys remain cbd.activeSession.v7 and cbd.report.v7. for safe V7 migration.
const pendingSessions = new Map();
let remoteRepository = null;
let remoteReady = false;
let initializationPromise = null;
let flushPromise = null;
let lastRemoteError = null;
let onlineListenerInstalled = false;

export const localSessionRepository = Object.freeze({
  saveActive(session) {
    browser.saveActive(session);
    enqueueRemote(session);
  },
  loadActive() {
    return browser.loadActive();
  },
  clearActive() {
    browser.clearActive();
  },
  saveReport(session) {
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

if (firebaseConfig.enabled) void initializeRemotePersistence();

function enqueueRemote(session) {
  if (!firebaseConfig.enabled || !session?.id) return;
  pendingSessions.set(session.id, structuredClone(session));
  if (remoteReady) void flushPending();
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
    flushPromise = null;
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
