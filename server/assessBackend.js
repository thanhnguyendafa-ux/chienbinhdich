import { firebaseConfig } from '../src/config/firebaseConfig.js';
import { normalizeLegacyAssignmentCode } from '../src/core/lessonLinks.js';
import { DELIVERY_MODE_ASSESS, CURRENT_DELIVERY_CONTRACT_VERSION } from '../src/core/deliveryMode.js';
import { isAssessableItem, validateAssessDelivery } from '../src/core/assessScoringPolicy.js';
import { sanitizeAssessLesson } from '../src/core/assessPayload.js';
import { evaluateQuestion, questionTypeForItem } from '../src/core/questionTypes.js';
import { loadLessonSet } from '../src/repositories/lessonRepository.js';
import { applyLessonContentOverride, applyLessonMasterySetting } from '../src/services/effectiveLessonService.js';

const projectId = firebaseConfig.project.projectId;
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

export function bearerToken(req) {
  const header = String(req?.headers?.authorization ?? '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw assessBackendError('auth_required', 'Firebase authentication is required.', 401);
  return match[1];
}

export async function getAssessLessonPayload({ code, token }) {
  const { delivery, lesson } = await loadAssessDelivery({ code, token });
  return Object.freeze({
    delivery: publicDelivery(delivery),
    lesson: sanitizeAssessLesson(lesson)
  });
}

export async function recordAssessAttempt({ token, payload }) {
  const code = normalizeLegacyAssignmentCode(payload?.code);
  const sessionId = String(payload?.sessionId ?? '').trim();
  const itemId = String(payload?.itemId ?? '').trim();
  const promptIndex = Number(payload?.promptIndex);
  const skipped = payload?.skipped === true;
  if (!code || !sessionId || !itemId || !Number.isInteger(promptIndex) || promptIndex < 0) {
    throw assessBackendError('assess_request_invalid', 'Invalid Assess attempt request.', 400);
  }

  const { delivery, lesson } = await loadAssessDelivery({ code, token });
  const session = await firestoreGet(`sessions/${encodePathSegment(sessionId)}`, token);
  if (!session) throw assessBackendError('assess_session_not_found', 'Assess session not found.', 404);
  validateSessionAgainstDelivery(session, delivery);

  const item = lesson.items[promptIndex];
  if (!item || String(item.id) !== itemId || !isAssessableItem(lesson, item)) {
    throw assessBackendError('assess_item_invalid', 'Assess item does not match the trusted delivery.', 400);
  }

  const submittedAt = finiteTime(payload?.attemptMeta?.submittedAt, Date.now());
  const startedAt = finiteTime(payload?.attemptMeta?.startedAt, submittedAt);
  const rawResponse = skipped ? null : payload?.response;
  const result = skipped
    ? { normalizedResponse: null, displayResponse: '' }
    : evaluateQuestion(item, rawResponse, { typingTolerance: session.typingToleranceAtStart === true });

  const attemptId = `${sessionId}-q${promptIndex}`;
  const attempt = {
    id: attemptId,
    itemId,
    questionType: questionTypeForItem(item),
    assessmentMode: 'scored',
    promptIndex,
    attemptNumber: 1,
    submittedResponse: result.normalizedResponse,
    submittedAnswer: String(result.displayResponse ?? ''),
    startedAt,
    submittedAt,
    responseDurationMs: Math.max(0, submittedAt - startedAt),
    inputMethod: normalizeInputMethod(payload?.attemptMeta?.inputMethod),
    pasteDetected: payload?.attemptMeta?.pasteDetected === true,
    skipped,
    deliveryMode: DELIVERY_MODE_ASSESS,
    gradingContractVersion: CURRENT_DELIVERY_CONTRACT_VERSION,
    serverRecordedAt: Date.now(),
    sessionId,
    ownerUid: String(session.ownerUid ?? '')
  };

  try {
    await firestoreCreate(`sessions/${encodePathSegment(sessionId)}/attempts`, attemptId, attempt, token);
  } catch (error) {
    if (error?.code !== 'firestore_already_exists') throw error;
  }

  return Object.freeze({
    ok: true,
    attemptId,
    recordedAt: Date.now()
  });
}

export async function loadAssessDelivery({ code, token }) {
  const normalizedCode = normalizeLegacyAssignmentCode(code);
  if (!normalizedCode) throw assessBackendError('assignment_invalid', 'Invalid Assess delivery code.', 400);
  const delivery = await firestoreGet(`assignments/${normalizedCode}`, token);
  if (!delivery || delivery.active !== true) {
    throw assessBackendError('assignment_not_found', 'Assess delivery is not available.', 404);
  }
  if (delivery.deliveryMode !== DELIVERY_MODE_ASSESS
    || Number(delivery.deliveryContractVersion) !== CURRENT_DELIVERY_CONTRACT_VERSION) {
    throw assessBackendError('delivery_mode_mismatch', 'This delivery is not an Assess delivery.', 403);
  }

  const staticLesson = await loadLessonSet(String(delivery.setId));
  if (Number(delivery.setVersion ?? staticLesson.version ?? 1) !== Number(staticLesson.version ?? 1)) {
    throw assessBackendError('delivery_version_mismatch', 'Assess delivery uses an unavailable lesson version.', 409);
  }

  const revision = Number(delivery.contentRevisionAtIssue ?? 0);
  const revisionId = String(delivery.contentRevisionIdAtIssue ?? '').trim();
  let content = null;
  if (revision > 0) {
    if (!revisionId) throw assessBackendError('delivery_content_snapshot_invalid', 'Assess content snapshot is incomplete.', 409);
    content = await firestoreGet(
      `lessonContent/${encodePathSegment(delivery.setId)}/revisions/${encodePathSegment(revisionId)}`,
      token
    );
    if (!content || Number(content.revision) !== revision) {
      throw assessBackendError('delivery_content_snapshot_missing', 'Assess content snapshot is unavailable.', 409);
    }
  }

  const setting = {
    passThreshold: Number(delivery.passThresholdAtIssue ?? staticLesson.passThreshold ?? 80),
    typingTolerance: delivery.typingToleranceAtIssue === true
  };
  let lesson = applyLessonMasterySetting(applyLessonContentOverride(staticLesson, content), setting);
  lesson = Object.freeze({
    ...lesson,
    assessmentPolicy: delivery.assessmentPolicyAtIssue ?? lesson.assessmentPolicy ?? null,
    assessmentContractVersion: delivery.assessmentContractVersionAtIssue ?? lesson.assessmentContractVersion ?? null,
    completionPolicy: delivery.completionPolicyAtIssue ?? lesson.completionPolicy ?? null
  });
  validateAssessDelivery(lesson);
  return { delivery, lesson };
}

function validateSessionAgainstDelivery(session, delivery) {
  if (session.deliveryModeAtStart !== DELIVERY_MODE_ASSESS) {
    throw assessBackendError('assess_session_mode_invalid', 'Session is not Assess.', 403);
  }
  if (Number(session.deliveryContractVersionAtStart) !== Number(delivery.deliveryContractVersion)) {
    throw assessBackendError('assess_session_contract_invalid', 'Session delivery contract does not match.', 409);
  }
  if (String(session.assignmentId ?? '') !== String(delivery.id ?? delivery.code ?? '')) {
    throw assessBackendError('assess_session_delivery_invalid', 'Session delivery does not match.', 403);
  }
  if (String(session.setId ?? '') !== String(delivery.setId ?? '')) {
    throw assessBackendError('assess_session_set_invalid', 'Session lesson does not match.', 409);
  }
  if (Number(session.contentRevisionAtStart ?? 0) !== Number(delivery.contentRevisionAtIssue ?? 0)) {
    throw assessBackendError('assess_session_revision_invalid', 'Session content snapshot does not match.', 409);
  }
}

function publicDelivery(delivery) {
  return Object.freeze({
    id: String(delivery.id ?? delivery.code),
    code: String(delivery.code),
    slug: String(delivery.slug),
    setId: String(delivery.setId),
    setVersion: Number(delivery.setVersion ?? 1),
    deliveryMode: String(delivery.deliveryMode),
    deliveryContractVersion: Number(delivery.deliveryContractVersion),
    contentRevisionAtIssue: Number(delivery.contentRevisionAtIssue ?? 0),
    contentRevisionIdAtIssue: delivery.contentRevisionIdAtIssue ?? null,
    passThresholdAtIssue: Number(delivery.passThresholdAtIssue ?? 80),
    typingToleranceAtIssue: delivery.typingToleranceAtIssue === true,
    assessmentPolicyAtIssue: delivery.assessmentPolicyAtIssue ?? null,
    assessmentContractVersionAtIssue: delivery.assessmentContractVersionAtIssue ?? null,
    completionPolicyAtIssue: delivery.completionPolicyAtIssue ?? null
  });
}

async function firestoreGet(path, token) {
  const response = await fetch(`${firestoreBase}/${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw await firestoreError(response);
  const document = await response.json();
  return {
    ...decodeMap(document.fields ?? {}),
    id: decodeURIComponent(String(document.name ?? '').split('/').at(-1) ?? '')
  };
}

async function firestoreCreate(collectionPath, documentId, data, token) {
  const url = `${firestoreBase}/${collectionPath}?documentId=${encodeURIComponent(documentId)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: encodeMap(data) })
  });
  if (response.status === 409) {
    const error = assessBackendError('firestore_already_exists', 'Attempt already recorded.', 409);
    throw error;
  }
  if (!response.ok) throw await firestoreError(response);
  return response.json();
}

async function firestoreError(response) {
  const body = await response.json().catch(() => ({}));
  const status = Number(response.status);
  const code = status === 401 ? 'auth_required'
    : status === 403 ? 'firestore_forbidden'
      : status === 404 ? 'firestore_not_found'
        : 'firestore_error';
  return assessBackendError(code, body?.error?.message ?? 'Firestore request failed.', status || 500);
}

function encodeMap(value) {
  const output = {};
  for (const [key, child] of Object.entries(value ?? {})) output[key] = encodeValue(child);
  return output;
}

function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'object') return { mapValue: { fields: encodeMap(value) } };
  return { stringValue: String(value) };
}

function decodeMap(fields) {
  const output = {};
  for (const [key, value] of Object.entries(fields ?? {})) output[key] = decodeValue(value);
  return output;
}

function decodeValue(value) {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return Date.parse(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue?.values ?? []).map(decodeValue);
  if ('mapValue' in value) return decodeMap(value.mapValue?.fields ?? {});
  return null;
}

function normalizeInputMethod(value) {
  return ['typed', 'paste', 'mixed', 'choice', 'tap', 'unknown'].includes(value) ? value : 'unknown';
}

function finiteTime(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value ?? ''));
}

export function assessBackendError(code, message, status = 500) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}
