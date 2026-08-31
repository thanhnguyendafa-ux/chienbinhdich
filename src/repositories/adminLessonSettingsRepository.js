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

    async savePassThreshold(setId, passThresholdOrPolicy, updatedAt = Date.now()) {
      return mutateSetting(adminClient, setId, updatedAt, overrides => {
        if (typeof passThresholdOrPolicy === 'object' && passThresholdOrPolicy !== null) {
          const next = { ...overrides, passThreshold: passThresholdOrPolicy.passThreshold };
          if (passThresholdOrPolicy.effortPassEnabled !== undefined) {
            next.effortPassEnabled = passThresholdOrPolicy.effortPassEnabled === true;
          }
          if (passThresholdOrPolicy.effortPassMinutes !== undefined) {
            next.effortPassMinutes = Number(passThresholdOrPolicy.effortPassMinutes);
          }
          return next;
        }
        return { ...overrides, passThreshold: passThresholdOrPolicy };
      });
    },

    async resetPassThreshold(setId, updatedAt = Date.now()) {
      return mutateSetting(adminClient, setId, updatedAt, overrides => {
        const next = { ...overrides };
        delete next.passThreshold;
        delete next.effortPassEnabled;
        delete next.effortPassMinutes;
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
  return mutateLessonSettingTransaction({ client, user, setId, updatedAt, mutate });
}

export async function mutateLessonSettingTransaction({ client, user, setId, updatedAt, mutate }) {
  const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
  return client.firestore.runTransaction(client.db, async transaction => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists()
      ? normalizeLessonSettingRecord(snapshot.id, snapshot.data())
      : null;
    const nextOverrides = mutate(lessonSettingOverrides(current));

    if (Object.keys(nextOverrides).length === 0) {
      transaction.delete(ref);
      return null;
    }

    const document = lessonSettingDocumentFor(setId, nextOverrides, user.uid, updatedAt);
    transaction.set(ref, document);
    return normalizeLessonSettingRecord(String(setId), document);
  });
}

async function readSetting(client, setId) {
  const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
  const snapshot = await client.firestore.getDoc(ref);
  if (!snapshot.exists()) return null;
  return normalizeLessonSettingRecord(snapshot.id, snapshot.data());
}
