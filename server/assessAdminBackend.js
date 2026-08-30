import { randomBytes } from 'node:crypto';
import { firebaseConfig } from '../src/config/firebaseConfig.js';
import { CURRENT_DELIVERY_CONTRACT_VERSION, DELIVERY_MODE_ASSESS } from '../src/core/deliveryMode.js';
import { validateAssessDelivery } from '../src/core/assessScoringPolicy.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';
import { applyLessonContentOverride, applyLessonMasterySetting } from '../src/services/effectiveLessonService.js';
import { createFirestoreRestClient } from './firestoreRest.js';
import { assessBackendError } from './assessBackend.js';
import { verifyFirebaseIdToken } from './firebaseServerAuth.js';
import { getPrivilegedGoogleAccessToken } from './googleAccessToken.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const firestore = createFirestoreRestClient(firebaseConfig.project.projectId);

export async function issueAssessDelivery({ token, setId, now = Date.now() }) {
  const normalizedSetId = String(setId ?? '').trim();
  if (!normalizedSetId) throw assessBackendError('assess_set_required', 'Lesson is required.', 400);

  const user = await verifyFirebaseIdToken(token);
  const googleToken = await getPrivilegedGoogleAccessToken();
  const adminMarker = await firestore.getDocument(`admins/${encodeURIComponent(user.uid)}`, googleToken);
  if (!adminMarker) throw assessBackendError('admin_required', 'Assess delivery requires Admin access.', 403);

  const [staticLesson, settingRecord, contentRecord] = await Promise.all([
    loadLessonSet(normalizedSetId),
    firestore.getDocument(`lessonSettings/${encodeURIComponent(normalizedSetId)}`, googleToken),
    firestore.getDocument(`lessonContent/${encodeURIComponent(normalizedSetId)}`, googleToken)
  ]);
  const content = contentRecord?.active === true ? contentRecord : null;
  const lesson = applyLessonMasterySetting(applyLessonContentOverride(staticLesson, content), settingRecord);
  validateAssessDelivery(lesson);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = randomCode();
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
    try {
      await firestore.createDocument('assignments', code, delivery, googleToken);
      return delivery;
    } catch (error) {
      if (error?.code === 'firestore_already_exists') continue;
      throw error;
    }
  }

  throw assessBackendError('assess_code_exhausted', 'Không tạo được mã Assess duy nhất. Hãy thử lại.', 503);
}

function randomCode() {
  const bytes = randomBytes(6);
  return [...bytes].map(value => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
}
