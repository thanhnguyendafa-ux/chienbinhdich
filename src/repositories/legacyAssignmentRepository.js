import { normalizeLegacyAssignmentCode } from '../core/lessonLinks.js';
import { ensureAnonymousFirebaseUser, getFirebaseClient } from './firebaseClient.js';

const STUDENT_CONTEXT = 'student';

export function createLegacyAssignmentRepository(project) {
  let clientPromise = null;
  const studentClient = () => {
    clientPromise ??= getFirebaseClient(project, STUDENT_CONTEXT);
    return clientPromise;
  };

  return Object.freeze({
    async getStudentAssignment(code) {
      const client = await studentClient();
      await ensureAnonymousFirebaseUser(client);
      const normalizedCode = normalizeLegacyAssignmentCode(code);
      if (!normalizedCode) throw assignmentError('assignment_invalid', 'Mã assignment không hợp lệ.');
      const ref = client.firestore.doc(client.db, 'assignments', normalizedCode);
      const snapshot = await client.firestore.getDoc(ref);
      if (!snapshot.exists()) throw assignmentError('assignment_not_found', 'Link bài tập cũ không tồn tại.');
      const assignment = { ...snapshot.data(), id: snapshot.id };
      if (assignment.active !== true) throw assignmentError('assignment_closed', 'Bài tập này đã được giáo viên đóng.');
      return assignment;
    }
  });
}

function assignmentError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
