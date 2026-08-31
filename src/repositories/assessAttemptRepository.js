import { CURRENT_DELIVERY_CONTRACT_VERSION, DELIVERY_MODE_ASSESS } from '../core/deliveryMode.js';
import { assessSubmittedAnswerDisplay, cloneAssessResponse } from '../core/assessResponse.js';
import { questionTypeForItem } from '../core/questionTypes.js';
import { ensureAnonymousFirebaseUser, getFirebaseClient } from './firebaseClient.js';

export function createAssessAttemptRepository(project) {
  let clientPromise = null;
  const client = async () => {
    clientPromise ??= getFirebaseClient(project, 'student');
    return clientPromise;
  };

  return Object.freeze({
    async record({ session, item, promptIndex, response, skipped = false, attemptMeta = {} }) {
      if (!session?.id || session.deliveryModeAtStart !== DELIVERY_MODE_ASSESS) {
        throw new Error('Assess session is required.');
      }
      const index = Number(promptIndex);
      if (!Number.isInteger(index) || index < 0 || !item?.id) throw new Error('Assess item is invalid.');

      const state = await client();
      const user = await ensureAnonymousFirebaseUser(state);
      const attemptId = `${session.id}-q${index}`;
      const ref = state.firestore.doc(state.db, 'sessions', session.id, 'attempts', attemptId);
      const existing = await state.firestore.getDoc(ref);
      if (existing.exists()) return Object.freeze({ ok: true, attemptId, recordedAt: Number(existing.data()?.serverRecordedAt ?? 0) || null });

      const submittedAt = finiteTime(attemptMeta.submittedAt, Date.now());
      const startedAt = finiteTime(attemptMeta.startedAt, submittedAt);
      const rawResponse = skipped ? null : cloneAssessResponse(response);
      const attempt = Object.freeze({
        id: attemptId,
        itemId: String(item.id),
        questionType: questionTypeForItem(item),
        assessmentMode: 'scored',
        promptIndex: index,
        attemptNumber: 1,
        submittedResponse: rawResponse,
        submittedAnswer: assessSubmittedAnswerDisplay(item, rawResponse, skipped),
        startedAt,
        submittedAt,
        responseDurationMs: Math.max(0, submittedAt - startedAt),
        inputMethod: normalizeInputMethod(attemptMeta.inputMethod),
        pasteDetected: attemptMeta.pasteDetected === true,
        skipped: skipped === true,
        deliveryMode: DELIVERY_MODE_ASSESS,
        gradingContractVersion: CURRENT_DELIVERY_CONTRACT_VERSION,
        // Schema-compatibility field. It is a client timestamp and never a scoring/security truth.
        serverRecordedAt: Date.now(),
        sessionId: String(session.id),
        ownerUid: user.uid
      });
      await state.firestore.setDoc(ref, attempt);
      return Object.freeze({ ok: true, attemptId, recordedAt: attempt.serverRecordedAt });
    }
  });
}

function normalizeInputMethod(value) {
  return ['typed', 'paste', 'mixed', 'choice', 'tap', 'unknown'].includes(value) ? value : 'unknown';
}

function finiteTime(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
