import { requireAdmin } from './adminAccess.js';
import { getFirebaseClient } from './firebaseClient.js';
import { CURRENT_DELIVERY_CONTRACT_VERSION, DELIVERY_MODE_ASSESS } from '../core/deliveryMode.js';
import { validateAssessDelivery } from '../core/assessScoringPolicy.js';

const ADMIN_CONTEXT = 'admin';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createAssessDeliveryRepository(project) {
  let clientPromise = null;
  const adminClient = () => {
    clientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async createDelivery(lesson, now = Date.now()) {
      validateAssessDelivery(lesson);
      const { client, user } = await requireAdmin(adminClient);
      const code = await uniqueCode(client);
      const delivery = Object.freeze({
        id: code,
        code,
        slug: String(lesson.lessonSlug),
        setId: String(lesson.id),
        setVersion: Number(lesson.version ?? 1),
        active: true,
        createdBy: user.uid,
        createdAt: now,
        deliveryMode: DELIVERY_MODE_ASSESS,
        deliveryContractVersion: CURRENT_DELIVERY_CONTRACT_VERSION,
        contentRevisionAtIssue: Number(lesson.contentPolicy?.revision ?? 0),
        contentRevisionIdAtIssue: lesson.contentPolicy?.revisionId ?? null,
        passThresholdAtIssue: Number(lesson.passThreshold ?? 80),
        typingToleranceAtIssue: lesson.typingTolerance === true,
        assessmentPolicyAtIssue: lesson.assessmentPolicy ?? null,
        assessmentContractVersionAtIssue: lesson.assessmentContractVersion ?? null,
        completionPolicyAtIssue: lesson.completionPolicy ?? null
      });
      const ref = client.firestore.doc(client.db, 'assignments', code);
      await client.firestore.setDoc(ref, delivery);
      return delivery;
    },
    buildUrl(locationLike, delivery) {
      const origin = new URL(locationLike?.href ?? String(locationLike ?? 'https://example.invalid/'), 'https://example.invalid').origin;
      const assignment = `${delivery.slug}-${delivery.code}`;
      return `${origin}/assess?assignment=${encodeURIComponent(assignment)}`;
    }
  });
}

async function uniqueCode(client) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = randomCode();
    const ref = client.firestore.doc(client.db, 'assignments', code);
    const snapshot = await client.firestore.getDoc(ref);
    if (!snapshot.exists()) return code;
  }
  throw new Error('Không tạo được mã Assess duy nhất. Hãy thử lại.');
}

function randomCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return [...bytes].map(value => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
}
