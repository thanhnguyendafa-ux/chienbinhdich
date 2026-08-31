import { buildAssessDelivery } from '../core/assessDelivery.js';
import { requireAdmin } from './adminAccess.js';
import { getFirebaseClient } from './firebaseClient.js';
import { normalizeLessonContentRecord } from './lessonContentModel.js';
import { loadLessonSet } from './lessonRepository.js';
import { normalizeLessonSettingRecord } from './lessonSettingsModel.js';
import { applyLessonContentOverride, applyLessonMasterySetting } from '../services/effectiveLessonService.js';

const ADMIN_CONTEXT = 'admin';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createAssessDeliveryRepository(project) {
  let clientPromise = null;
  const adminClient = () => {
    clientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async createDelivery(setId, now = Date.now()) {
      const normalizedSetId = String(setId ?? '').trim();
      if (!normalizedSetId) throw new Error('Lesson is required.');
      const { client, user } = await requireAdmin(adminClient);
      const [staticLesson, content, setting] = await Promise.all([
        loadLessonSet(normalizedSetId),
        readCurrentContent(client, normalizedSetId),
        readSetting(client, normalizedSetId)
      ]);
      const lesson = applyLessonMasterySetting(
        applyLessonContentOverride(staticLesson, content?.active === true ? content : null),
        setting
      );

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const code = randomCode();
        const delivery = buildAssessDelivery({ lesson, code, createdBy: user.uid, now });
        const ref = client.firestore.doc(client.db, 'assignments', code);
        const created = await createIfAbsent(client, ref, delivery);
        if (created) return delivery;
      }
      const error = new Error('Không tạo được mã Assess duy nhất. Hãy thử lại.');
      error.code = 'assess_code_exhausted';
      throw error;
    },

    buildUrl(locationLike, delivery) {
      const origin = new URL(locationLike?.href ?? String(locationLike ?? 'https://example.invalid/'), 'https://example.invalid').origin;
      const assignment = `${delivery.slug}-${delivery.code}`;
      return `${origin}/assess?assignment=${encodeURIComponent(assignment)}`;
    }
  });
}

async function readCurrentContent(client, setId) {
  const ref = client.firestore.doc(client.db, 'lessonContent', String(setId));
  const snapshot = await client.firestore.getDoc(ref);
  return snapshot.exists() ? normalizeLessonContentRecord(String(setId), snapshot.data()) : null;
}

async function readSetting(client, setId) {
  const ref = client.firestore.doc(client.db, 'lessonSettings', String(setId));
  const snapshot = await client.firestore.getDoc(ref);
  return snapshot.exists() ? normalizeLessonSettingRecord(String(setId), snapshot.data()) : null;
}

async function createIfAbsent(client, ref, delivery) {
  return client.firestore.runTransaction(client.db, async transaction => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) return false;
    transaction.set(ref, delivery);
    return true;
  });
}

function randomCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return [...bytes].map(value => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
}
