import { containsAssessAnswerKey, sanitizeAssessLesson } from './assessPayload.js';
import { validateAssessDelivery } from './assessScoringPolicy.js';
import { CURRENT_DELIVERY_CONTRACT_VERSION, DELIVERY_MODE_ASSESS } from './deliveryMode.js';

export const ASSESS_DELIVERY_SNAPSHOT_MAX_BYTES = 800 * 1024;

export function buildAssessDelivery({ lesson, code, createdBy, now = Date.now() }) {
  validateAssessDelivery(lesson);
  const normalizedCode = normalizeCode(code);
  const owner = String(createdBy ?? '').trim();
  if (!normalizedCode) throw assessDeliveryError('assess_code_invalid', 'Assess code is required.');
  if (!owner) throw assessDeliveryError('assess_admin_invalid', 'Admin identity is required.');

  const sanitizedLesson = sanitizeAssessLesson(lesson);
  if (containsAssessAnswerKey(sanitizedLesson)) {
    throw assessDeliveryError('assess_snapshot_unsafe', 'Assess snapshot contains answer-key data.');
  }
  const snapshotBytes = jsonByteLength(sanitizedLesson);
  if (snapshotBytes > ASSESS_DELIVERY_SNAPSHOT_MAX_BYTES) {
    throw assessDeliveryError(
      'assess_snapshot_too_large',
      `Assess learner snapshot is too large (${snapshotBytes} bytes). Split the lesson before issuing Assess.`
    );
  }

  return Object.freeze({
    id: normalizedCode,
    code: normalizedCode,
    slug: String(lesson.lessonSlug ?? '').trim(),
    setId: String(lesson.id),
    setVersion: Number(lesson.version ?? 1),
    active: true,
    createdBy: owner,
    createdAt: Number(now),
    deliveryMode: DELIVERY_MODE_ASSESS,
    deliveryContractVersion: CURRENT_DELIVERY_CONTRACT_VERSION,
    contentRevisionAtIssue: Number(lesson.contentPolicy?.revision ?? 0),
    contentRevisionIdAtIssue: lesson.contentPolicy?.revisionId ?? null,
    passThresholdAtIssue: Number(lesson.passThreshold ?? 80),
    typingToleranceAtIssue: lesson.typingTolerance === true,
    assessmentPolicyAtIssue: lesson.assessmentPolicy ?? null,
    assessmentContractVersionAtIssue: lesson.assessmentContractVersion ?? null,
    completionPolicyAtIssue: lesson.completionPolicy ?? null,
    sanitizedLesson,
    sanitizedLessonBytes: snapshotBytes
  });
}

export function validateAssessAssignmentSnapshot(assignment) {
  if (!assignment || assignment.deliveryMode !== DELIVERY_MODE_ASSESS) {
    throw assessDeliveryError('delivery_mode_mismatch', 'This delivery is not Assess.');
  }
  if (Number(assignment.deliveryContractVersion) !== CURRENT_DELIVERY_CONTRACT_VERSION) {
    throw assessDeliveryError('delivery_contract_mismatch', 'Unsupported Assess delivery contract.');
  }
  const lesson = assignment.sanitizedLesson;
  if (!lesson || typeof lesson !== 'object' || Array.isArray(lesson)) {
    throw assessDeliveryError('assess_snapshot_missing', 'Assess learner snapshot is missing.');
  }
  if (containsAssessAnswerKey(lesson)) {
    throw assessDeliveryError('assess_snapshot_unsafe', 'Assess learner snapshot contains answer-key data.');
  }
  if (String(lesson.id) !== String(assignment.setId)
    || Number(lesson.version) !== Number(assignment.setVersion)
    || !Array.isArray(lesson.items)
    || Number(lesson.itemCount) !== lesson.items.length
    || lesson.items.length < 1) {
    throw assessDeliveryError('assess_snapshot_invalid', 'Assess learner snapshot does not match its delivery.');
  }
  return lesson;
}

function jsonByteLength(value) {
  const text = JSON.stringify(value);
  return typeof TextEncoder === 'function'
    ? new TextEncoder().encode(text).byteLength
    : text.length;
}

function normalizeCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

function assessDeliveryError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
