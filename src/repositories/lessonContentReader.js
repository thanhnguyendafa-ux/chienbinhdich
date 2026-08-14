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
      try {
        const snapshot = await client.firestore.getDoc(ref);
        if (!snapshot.exists()) return null;
        const record = normalizeLessonContentRecord(String(setId), snapshot.data());
        return record.active ? record : null;
      } catch (error) {
        // Compatibility bridge while the new lessonContent Firestore rules are not deployed yet.
        // This is safe only for the current pointer before any Admin content revision exists.
        if (isPermissionDenied(error)) {
          console.warn('Lesson Content CMS rules are not available yet; using Base Content.', { setId });
          return null;
        }
        throw error;
      }
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
      // Never fall back for a historical revision: a session that started on revision N
      // must either load that exact revision or fail loudly rather than silently use Base Content.
      const snapshot = await client.firestore.getDoc(ref);
      if (!snapshot.exists()) return null;
      return normalizeLessonContentRecord(String(setId), snapshot.data());
    }
  });
}

function isPermissionDenied(error) {
  const value = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  return value.includes('permission-denied') || value.includes('permission denied');
}
