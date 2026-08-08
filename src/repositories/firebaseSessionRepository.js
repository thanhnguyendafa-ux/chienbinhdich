import {
  FIREBASE_SDK_VERSION,
  ensureAnonymousFirebaseUser,
  getFirebaseClient,
  validateFirebaseProjectConfig
} from './firebaseClient.js';

const ATTEMPT_BATCH_SIZE = 400;

export { validateFirebaseProjectConfig };

export function sessionDocumentFor(session, ownerUid, syncedAt = Date.now()) {
  if (!session?.id) throw new Error('Session id is required for Firebase persistence.');
  if (!ownerUid) throw new Error('Firebase owner uid is required.');
  const { attempts = [], ...metadata } = structuredClone(session);
  return {
    ...metadata,
    ownerUid,
    attemptCount: attempts.length,
    persistenceVersion: 1,
    syncedAt
  };
}

export function attemptDocumentFor(attempt, sessionId, ownerUid) {
  if (!attempt?.id) throw new Error('Attempt id is required for Firebase persistence.');
  return {
    ...structuredClone(attempt),
    sessionId,
    ownerUid
  };
}

export function createFirebaseSessionRepository(project) {
  let initialized = null;

  return Object.freeze({
    async initialize() {
      if (!initialized) initialized = initializeFirebase(project);
      return initialized;
    },
    async saveSession(session) {
      const state = await this.initialize();
      const { db, uid, firestore } = state;
      const sessionRef = firestore.doc(db, 'sessions', session.id);
      const sessionDocument = sessionDocumentFor(session, uid);
      await firestore.setDoc(sessionRef, sessionDocument, { merge: true });

      const attempts = Array.isArray(session.attempts) ? session.attempts : [];
      for (let offset = 0; offset < attempts.length; offset += ATTEMPT_BATCH_SIZE) {
        const batch = firestore.writeBatch(db);
        for (const attempt of attempts.slice(offset, offset + ATTEMPT_BATCH_SIZE)) {
          const attemptRef = firestore.doc(db, 'sessions', session.id, 'attempts', attempt.id);
          batch.set(attemptRef, attemptDocumentFor(attempt, session.id, uid));
        }
        await batch.commit();
      }

      return { sessionId: session.id, attemptCount: attempts.length, ownerUid: uid };
    }
  });
}

async function initializeFirebase(project) {
  const client = await getFirebaseClient(project, 'student');
  const user = await ensureAnonymousFirebaseUser(client);

  return {
    app: client.app,
    auth: client.auth,
    db: client.db,
    uid: user.uid,
    firestore: client.firestore
  };
}

export const firebaseSdkVersion = FIREBASE_SDK_VERSION;
