import { getFirebaseClient } from './firebaseClient.js';
import { requireAdmin } from './adminAccess.js';
import { lessonContentDocumentFor, normalizeLessonContentRecord, revisionIdFor } from './lessonContentModel.js';

const ADMIN_CONTEXT = 'admin';

export function createAdminLessonContentRepository(project) {
  let clientPromise = null;
  const adminClient = () => {
    clientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async listCurrentContent() {
      const { client } = await requireAdmin(adminClient);
      const snapshot = await client.firestore.getDocs(client.firestore.collection(client.db, 'lessonContent'));
      return snapshot.docs
        .map(doc => normalizeLessonContentRecord(doc.id, doc.data()))
        .filter(record => record.active);
    },

    async getCurrentContent(setId) {
      const { client } = await requireAdmin(adminClient);
      const current = await readCurrentRecord(client, setId);
      return current?.active ? current : null;
    },

    async getRevisionContent(setId, revision) {
      const { client } = await requireAdmin(adminClient);
      return readRevision(client, setId, revision);
    },

    async listRevisions(setId) {
      const { client } = await requireAdmin(adminClient);
      const ref = client.firestore.collection(client.db, 'lessonContent', String(setId), 'revisions');
      const snapshot = await client.firestore.getDocs(ref);
      return snapshot.docs
        .map(doc => normalizeLessonContentRecord(String(setId), doc.data()))
        .sort((a, b) => b.revision - a.revision);
    },

    async publishContent(setId, { baseVersion = 1, items }, updatedAt = Date.now()) {
      const { client, user } = await requireAdmin(adminClient);
      const currentRef = client.firestore.doc(client.db, 'lessonContent', String(setId));
      return client.firestore.runTransaction(client.db, async transaction => {
        const currentSnapshot = await transaction.get(currentRef);
        const current = currentSnapshot.exists()
          ? normalizeLessonContentRecord(String(setId), currentSnapshot.data())
          : null;
        const nextRevision = (current?.revision ?? 0) + 1;
        const document = lessonContentDocumentFor({
          setId,
          revision: nextRevision,
          baseVersion,
          items,
          updatedBy: user.uid,
          updatedAt,
          active: true
        });
        const revisionRef = client.firestore.doc(
          client.db,
          'lessonContent',
          String(setId),
          'revisions',
          revisionIdFor(nextRevision)
        );
        transaction.set(revisionRef, document);
        transaction.set(currentRef, document);
        return normalizeLessonContentRecord(String(setId), document);
      });
    },

    async resetToBase(setId, updatedAt = Date.now()) {
      const { client, user } = await requireAdmin(adminClient);
      const currentRef = client.firestore.doc(client.db, 'lessonContent', String(setId));
      return client.firestore.runTransaction(client.db, async transaction => {
        const snapshot = await transaction.get(currentRef);
        if (!snapshot.exists()) return null;
        const current = normalizeLessonContentRecord(String(setId), snapshot.data());
        if (!current.active) return null;
        const inactive = lessonContentDocumentFor({
          setId,
          revision: current.revision,
          baseVersion: current.baseVersion,
          items: current.items,
          updatedBy: user.uid,
          updatedAt,
          active: false
        });
        transaction.set(currentRef, inactive);
        return null;
      });
    }
  });
}

async function readCurrentRecord(client, setId) {
  const ref = client.firestore.doc(client.db, 'lessonContent', String(setId));
  const snapshot = await client.firestore.getDoc(ref);
  if (!snapshot.exists()) return null;
  return normalizeLessonContentRecord(String(setId), snapshot.data());
}

async function readRevision(client, setId, revision) {
  if (!Number.isInteger(Number(revision)) || Number(revision) < 1) return null;
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
