import { getFirebaseClient } from './firebaseClient.js';
import { requireAdmin } from './adminAccess.js';
import { lessonSettingDocumentFor, normalizeLessonSettingRecord } from './lessonSettingsModel.js';

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
      const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
      const snapshot = await client.firestore.getDoc(ref);
      if (!snapshot.exists()) return null;
      return normalizeLessonSettingRecord(snapshot.id, snapshot.data());
    },

    async savePassThreshold(setId, passThreshold, updatedAt = Date.now()) {
      const { client, user } = await requireAdmin(adminClient);
      const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
      const document = lessonSettingDocumentFor(setId, passThreshold, user.uid, updatedAt);
      await client.firestore.setDoc(ref, document);
      return normalizeLessonSettingRecord(String(setId), document);
    },

    async resetPassThreshold(setId) {
      const { client } = await requireAdmin(adminClient);
      const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
      await client.firestore.deleteDoc(ref);
      return null;
    }
  });
}
