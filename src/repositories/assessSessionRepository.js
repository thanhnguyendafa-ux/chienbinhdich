import { ensureAnonymousFirebaseUser, getFirebaseClient } from './firebaseClient.js';
import { CURRENT_DELIVERY_CONTRACT_VERSION, DELIVERY_MODE_ASSESS } from '../core/deliveryMode.js';

const SESSION_SCHEMA_VERSION = 8;
const LOCAL_PREFIX = 'cbd.assess.session.v1.';

export function createAssessSessionRepository(project) {
  let clientPromise = null;
  const client = async () => {
    clientPromise ??= getFirebaseClient(project, 'student');
    return clientPromise;
  };

  async function firebaseState() {
    const state = await client();
    const user = await ensureAnonymousFirebaseUser(state);
    return { state, user };
  }

  async function persist(session) {
    const { state, user } = await firebaseState();
    const document = { ...session, ownerUid: user.uid, persistenceVersion: 1, syncedAt: Date.now() };
    const ref = state.firestore.doc(state.db, 'sessions', session.id);
    await state.firestore.setDoc(ref, document, { merge: true });
    localStorage.setItem(localKey(session.assignmentId), JSON.stringify(session));
    return session;
  }

  return Object.freeze({
    async create({ studentName, lesson, delivery, now = Date.now() }) {
      const firstItem = lesson.items[0];
      if (!firstItem) throw new Error('Assess lesson has no items.');
      const session = Object.freeze({
        schemaVersion: SESSION_SCHEMA_VERSION,
        id: createSessionId(now),
        studentName: String(studentName ?? '').trim(),
        setId: lesson.id,
        setVersion: lesson.version ?? 1,
        assignmentId: delivery.id,
        assignmentSlug: delivery.slug,
        entryMode: 'assess-delivery',
        deliveryModeAtStart: DELIVERY_MODE_ASSESS,
        deliveryContractVersionAtStart: Number(delivery.deliveryContractVersion ?? CURRENT_DELIVERY_CONTRACT_VERSION),
        passThresholdAtStart: Number(delivery.passThresholdAtIssue ?? 80),
        typingToleranceAtStart: delivery.typingToleranceAtIssue === true,
        assessmentPolicyAtStart: delivery.assessmentPolicyAtIssue ?? lesson.assessmentPolicy ?? null,
        assessmentContractVersionAtStart: delivery.assessmentContractVersionAtIssue ?? lesson.assessmentContractVersion ?? null,
        completionPolicyAtStart: delivery.completionPolicyAtIssue ?? lesson.completionPolicy ?? null,
        contentRevisionAtStart: Number(delivery.contentRevisionAtIssue ?? 0),
        contentRevisionIdAtStart: delivery.contentRevisionIdAtIssue ?? null,
        startedAt: now,
        completedAt: null,
        submittedAt: null,
        status: 'active',
        currentItemIndex: 0,
        currentItemId: firstItem.id,
        mainCursor: 0,
        attemptCount: 0,
        updatedAt: now
      });
      return persist(session);
    },
    async save(session) {
      return persist(session);
    },
    loadLocal(assignmentId) {
      try {
        const raw = localStorage.getItem(localKey(assignmentId));
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    clearLocal(assignmentId) {
      localStorage.removeItem(localKey(assignmentId));
    }
  });
}

function localKey(assignmentId) {
  return `${LOCAL_PREFIX}${String(assignmentId ?? '')}`;
}

function createSessionId(now) {
  const timePart = Number(now).toString(36).slice(-5).toUpperCase();
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const randomPart = [...bytes].map(value => value.toString(36)).join('').slice(0, 6).toUpperCase();
  return `AS-${timePart}${randomPart}`;
}
