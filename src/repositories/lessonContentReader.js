import { ensureAnonymousFirebaseUser, getFirebaseClient } from './firebaseClient.js';
import { normalizeLessonContentRecord, revisionIdFor } from './lessonContentModel.js';

export function createLessonContentReader(project) {
  let initialized = null;

  const initialize = async () => {
    if (!initialized) {
      initialized = getFirebaseClient(project, 'student').then(async client => {
        await ensureAnonymousFirebaseUser(client);
        return client;
      });
    }
    return initialized;
  };

  return Object.freeze({
    async getCurrentContent(setId) {
      if (!String(setId ?? '').trim()) throw new Error('setId is required.');
      const client = await initialize();
      const ref = client.firestore.doc(client.db, 'lessonContent', String(setId));
      const snapshot = await client.firestore.getDoc(ref);
      if (!snapshot.exists()) return null;
      return normalizeLessonContentRecord(String(setId), snapshot.data());
    },

    async getRevisionContent(setId, revision) {
      if (!String(setId ?? '').trim()) throw new Error('setId is required.');
      if (!Number.isInteger(Number(revision)) || Number(revision) < 1) return null;
      const client = await initialize();
      const ref = client.firestore.doc(
        client.db,
        'lessonContent',
        String(setId),
        'revisions',
        revisionIdFor(Number(revision))
      );
      const snapshot = await client.firestore.getDoc(ref);
      if (!snapshot.exists()) return null;
      return normalizeLessonContentRecord(String(setId), snapshot.data());
    }
  });
}
