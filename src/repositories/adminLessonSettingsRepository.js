import { getFirebaseClient } from './firebaseClient.js';
import { requireAdmin } from './adminAccess.js';
import { lessonSettingDocumentFor, lessonSettingOverrides, normalizeLessonSettingRecord } from './lessonSettingsModel.js';

const ADMIN_CONTEXT = 'admin';

export function createAdminLessonSettingsRepository(project) {
  let clientPromise = null;
  const adminClient = () => {
    clientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async listLessonSettings() {
      const { client } = await requireAdmin(adminClient);
      const snapshot = await client.firestore.getDocs(client.firestore.collection(client.db, 'lessonSettings'));
      return snapshot.docs.map(doc => normalizeLessonSettingRecord(doc.id, doc.data()));
    },

    async getLessonSetting(setId) {
      const { client } = await requireAdmin(adminClient);
      return readSetting(client, setId);
    },

    async savePassThreshold(setId, passThreshold, updatedAt = Date.now()) {
      return mutateSetting(adminClient, setId, updatedAt, overrides => ({ ...overrides, passThreshold }));
    },

    async resetPassThreshold(setId, updatedAt = Date.now()) {
      return mutateSetting(adminClient, setId, updatedAt, overrides => {
        const next = { ...overrides };
        delete next.passThreshold;
        return next;
      });
    },

    async saveTypingTolerance(setId, typingTolerance, updatedAt = Date.now()) {
      return mutateSetting(adminClient, setId, updatedAt, overrides => ({ ...overrides, typingTolerance }));
    },

    async resetTypingTolerance(setId, updatedAt = Date.now()) {
      return mutateSetting(adminClient, setId, updatedAt, overrides => {
        const next = { ...overrides };
        delete next.typingTolerance;
        return next;
      });
    }
  });
}

async function mutateSetting(adminClient, setId, updatedAt, mutate) {
  const { client, user } = await requireAdmin(adminClient);
  const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
  const current = await readSetting(client, setId);
  const nextOverrides = mutate(lessonSettingOverrides(current));
  if (Object.keys(nextOverrides).length === 0) {
    await client.firestore.deleteDoc(ref);
    return null;
  }
  const document = lessonSettingDocumentFor(setId, nextOverrides, user.uid, updatedAt);
  await client.firestore.setDoc(ref, document);
  return normalizeLessonSettingRecord(String(setId), document);
}

async function readSetting(client, setId) {
  const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
  const snapshot = await client.firestore.getDoc(ref);
  if (!snapshot.exists()) return null;
  return normalizeLessonSettingRecord(snapshot.id, snapshot.data());
}
