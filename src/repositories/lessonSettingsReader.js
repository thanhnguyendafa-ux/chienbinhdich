import { ensureAnonymousFirebaseUser, getFirebaseClient } from './firebaseClient.js';
import { normalizeLessonSettingRecord } from './lessonSettingsModel.js';

export function createLessonSettingsReader(project) {
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
    async getLessonSetting(setId) {
      if (!String(setId ?? '').trim()) throw new Error('setId is required.');
      const client = await initialize();
      const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
      const snapshot = await client.firestore.getDoc(ref);
      if (!snapshot.exists()) return null;
      return normalizeLessonSettingRecord(snapshot.id, snapshot.data());
    }
  });
}
