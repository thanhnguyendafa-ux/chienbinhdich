import { randomBytes } from 'node:crypto';
import { firebaseConfig } from '../src/config/firebaseConfig.js';
import { CURRENT_DELIVERY_CONTRACT_VERSION, DELIVERY_MODE_ASSESS } from '../src/core/deliveryMode.js';
import { validateAssessDelivery } from '../src/core/assessScoringPolicy.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';
import { applyLessonContentOverride, applyLessonMasterySetting } from '../src/services/effectiveLessonService.js';
import { createFirestoreRestClient } from './firestoreRest.js';
import { assessBackendError } from './assessBackend.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const firestore = createFirestoreRestClient(firebaseConfig.project.projectId);

export async function issueAssessDelivery({ token, setId, now = Date.now() }) {
  const normalizedSetId = String(setId ?? '').trim();
  if (!normalizedSetId) throw assessBackendError('assess_set_required', 'Lesson is required.', 400);

  const adminUid = firebaseUidFromToken(token);
  const adminMarker = await firestore.getDocument(`admins/${encodeURIComponent(adminUid)}`, token);
  if (!adminMarker) throw assessBackendError('admin_required', 'Assess delivery requires Admin access.', 403);

  const [staticLesson, settingRecord, contentRecord] = await Promise.all([
    loadLessonSet(normalizedSetId),
    firestore.getDocument(`lessonSettings/${encodeURIComponent(normalizedSetId)}`, token),
    firestore.getDocument(`lessonContent/${encodeURIComponent(normalizedSetId)}`, token)
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
      createdBy: adminUid,
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
      await firestore.createDocument('assignments', code, delivery, token);
      return delivery;
    } catch (error) {
      if (error?.code === 'firestore_already_exists') continue;
      throw error;
    }
  }

  throw assessBackendError('assess_code_exhausted', 'Không tạo được mã Assess duy nhất. Hãy thử lại.', 503);
}

function firebaseUidFromToken(token) {
  try {
    const parts = String(token ?? '').split('.');
    if (parts.length !== 3) throw new Error('invalid token');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const uid = String(payload.user_id ?? payload.sub ?? '').trim();
    if (!uid) throw new Error('missing uid');
    return uid;
  } catch {
    throw assessBackendError('auth_required', 'Firebase authentication is required.', 401);
  }
}

function randomCode() {
  const bytes = randomBytes(6);
  return [...bytes].map(value => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
}
