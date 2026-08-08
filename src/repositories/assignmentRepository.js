import {
  activityTypeSlug,
  generateAssignmentCode,
  normalizeAssignmentCode,
  normalizeAssignmentSlug
} from '../core/accessRouting.js';
import {
  ensureAnonymousFirebaseUser,
  getFirebaseClient,
  signInFirebaseAdmin,
  signOutFirebaseClient,
  waitForFirebaseAuth
} from './firebaseClient.js';

const ADMIN_CONTEXT = 'admin';
const STUDENT_CONTEXT = 'student';

export function assignmentDocumentFor({ descriptor, code, adminUid, now = Date.now() }) {
  if (!descriptor?.id) throw new Error('Set descriptor is required.');
  const normalizedCode = normalizeAssignmentCode(code);
  if (!normalizedCode) throw new Error('Assignment code is invalid.');
  if (!adminUid) throw new Error('Admin uid is required.');

  const slug = normalizeAssignmentSlug(descriptor.assignmentSlug);
  if (!slug) throw new Error(`Set ${descriptor.id} is missing assignmentSlug.`);

  return {
    id: normalizedCode,
    code: normalizedCode,
    slug,
    setId: descriptor.id,
    setVersion: descriptor.version ?? 1,
    title: descriptor.title,
    course: descriptor.course,
    unit: descriptor.unit,
    activityType: activityTypeSlug(descriptor.activityTypes),
    active: true,
    createdBy: adminUid,
    createdAt: now,
    updatedAt: now
  };
}

export function createFirebaseAssignmentRepository(project) {
  let adminClientPromise = null;
  let studentClientPromise = null;

  function adminClient() {
    adminClientPromise ??= getFirebaseClient(project, ADMIN_CONTEXT);
    return adminClientPromise;
  }

  function studentClient() {
    studentClientPromise ??= getFirebaseClient(project, STUDENT_CONTEXT);
    return studentClientPromise;
  }

  return Object.freeze({
    async getAdminState() {
      const client = await adminClient();
      const user = await waitForFirebaseAuth(client);
      if (!user) return { authenticated: false, isAdmin: false, user: null };
      const isAdmin = await hasAdminMarker(client, user.uid);
      return { authenticated: true, isAdmin, user };
    },

    async signInAdmin(email, password) {
      const client = await adminClient();
      const user = await signInFirebaseAdmin(client, email, password);
      const isAdmin = await hasAdminMarker(client, user.uid);
      if (!isAdmin) {
        await signOutFirebaseClient(client);
        throw new Error('Tài khoản này chưa được cấp quyền Admin Chiến Binh Dịch.');
      }
      return { user, isAdmin: true };
    },

    async signOutAdmin() {
      const client = await adminClient();
      await signOutFirebaseClient(client);
    },

    async createAssignment(descriptor, now = Date.now()) {
      const { client, user } = await requireAdmin(adminClient);
      const { firestore, db } = client;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const code = generateAssignmentCode();
        const ref = firestore.doc(db, 'assignments', code);
        const existing = await firestore.getDoc(ref);
        if (existing.exists()) continue;

        const document = assignmentDocumentFor({ descriptor, code, adminUid: user.uid, now });
        await firestore.setDoc(ref, document);
        return document;
      }

      throw new Error('Không thể tạo mã assignment duy nhất. Hãy thử lại.');
    },

    async disableAssignment(code, now = Date.now()) {
      const { client } = await requireAdmin(adminClient);
      const normalizedCode = requireCode(code);
      const ref = client.firestore.doc(client.db, 'assignments', normalizedCode);
      await client.firestore.updateDoc(ref, { active: false, updatedAt: now });
    },

    async enableAssignment(code, now = Date.now()) {
      const { client } = await requireAdmin(adminClient);
      const normalizedCode = requireCode(code);
      const ref = client.firestore.doc(client.db, 'assignments', normalizedCode);
      await client.firestore.updateDoc(ref, { active: true, updatedAt: now });
    },

    async listAssignments(limitCount = 100) {
      const { client } = await requireAdmin(adminClient);
      const { firestore, db } = client;
      const query = firestore.query(
        firestore.collection(db, 'assignments'),
        firestore.orderBy('createdAt', 'desc'),
        firestore.limit(limitCount)
      );
      const snapshot = await firestore.getDocs(query);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    },

    async getStudentAssignment(code) {
      const client = await studentClient();
      await ensureAnonymousFirebaseUser(client);
      const normalizedCode = requireCode(code);
      const ref = client.firestore.doc(client.db, 'assignments', normalizedCode);
      const snapshot = await client.firestore.getDoc(ref);
      if (!snapshot.exists()) throw assignmentError('assignment_not_found', 'Link bài tập không tồn tại.');
      const assignment = { ...snapshot.data(), id: snapshot.id };
      if (assignment.active !== true) throw assignmentError('assignment_closed', 'Bài tập này đã được giáo viên đóng.');
      return assignment;
    },

    async listSessions(limitCount = 100) {
      const { client } = await requireAdmin(adminClient);
      const { firestore, db } = client;
      const query = firestore.query(
        firestore.collection(db, 'sessions'),
        firestore.orderBy('syncedAt', 'desc'),
        firestore.limit(limitCount)
      );
      const snapshot = await firestore.getDocs(query);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    },

    async getSessionDetail(sessionId) {
      const { client } = await requireAdmin(adminClient);
      const { firestore, db } = client;
      const sessionRef = firestore.doc(db, 'sessions', sessionId);
      const [sessionSnapshot, attemptsSnapshot] = await Promise.all([
        firestore.getDoc(sessionRef),
        firestore.getDocs(
          firestore.query(
            firestore.collection(db, 'sessions', sessionId, 'attempts'),
            firestore.orderBy('submittedAt', 'asc')
          )
        )
      ]);

      if (!sessionSnapshot.exists()) throw new Error('Không tìm thấy session.');
      return {
        session: { ...sessionSnapshot.data(), id: sessionSnapshot.id },
        attempts: attemptsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      };
    }
  });
}

async function requireAdmin(clientFactory) {
  const client = await clientFactory();
  const user = await waitForFirebaseAuth(client);
  if (!user) throw new Error('Cần đăng nhập Admin.');
  if (!await hasAdminMarker(client, user.uid)) throw new Error('Tài khoản không có quyền Admin.');
  return { client, user };
}

async function hasAdminMarker(client, uid) {
  const ref = client.firestore.doc(client.db, 'admins', uid);
  const snapshot = await client.firestore.getDoc(ref);
  return snapshot.exists();
}

function requireCode(code) {
  const normalized = normalizeAssignmentCode(code);
  if (!normalized) throw assignmentError('assignment_invalid', 'Mã assignment không hợp lệ.');
  return normalized;
}

function assignmentError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
