import { getFirebaseClient } from './firebaseClient.js';
import { requireAdmin } from './adminAccess.js';
import { lessonReviewDocumentFor, normalizeLessonReviewRecord } from './lessonReviewModel.js';

const ADMIN_CONTEXT = 'admin';

export function createAdminLessonReviewRepository(project) {
  let clientPromise = null;
  const adminClient = () => {
    clientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async listLessonReviews() {
      const { client } = await requireAdmin(adminClient);
      try {
        const snapshot = await client.firestore.getDocs(client.firestore.collection(client.db, 'lessonReviews'));
        return snapshot.docs.map(doc => normalizeLessonReviewRecord(doc.id, doc.data()));
      } catch (error) {
        if (isPermissionDenied(error)) return [];
        throw error;
      }
    },

    async getLessonReview(setId) {
      const { client } = await requireAdmin(adminClient);
      try {
        const ref = client.firestore.doc(client.db, 'lessonReviews', String(setId));
        const snapshot = await client.firestore.getDoc(ref);
        if (!snapshot.exists()) return null;
        return normalizeLessonReviewRecord(snapshot.id, snapshot.data());
      } catch (error) {
        if (isPermissionDenied(error)) return null;
        throw error;
      }
    },

    async saveLessonReview(setId, review, updatedAt = Date.now()) {
      const { client, user } = await requireAdmin(adminClient);
      const ref = client.firestore.doc(client.db, 'lessonReviews', String(setId));
      const document = lessonReviewDocumentFor(setId, review, user.uid, updatedAt);
      try {
        await client.firestore.setDoc(ref, document);
        return normalizeLessonReviewRecord(String(setId), document);
      } catch (error) {
        throw reviewWriteError(error);
      }
    },

    async clearLessonReview(setId) {
      const { client } = await requireAdmin(adminClient);
      const ref = client.firestore.doc(client.db, 'lessonReviews', String(setId));
      try {
        await client.firestore.deleteDoc(ref);
        return null;
      } catch (error) {
        throw reviewWriteError(error);
      }
    }
  });
}

function reviewWriteError(error) {
  if (!isPermissionDenied(error)) return error;
  const next = new Error('Lesson Review chưa được bật trên Firestore. Cần cập nhật Firestore Rules trước khi đánh dấu kiểm duyệt.');
  next.code = 'lesson_review_rules_unavailable';
  next.cause = error;
  return next;
}

function isPermissionDenied(error) {
  const value = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  return value.includes('permission-denied') || value.includes('permission denied');
}
