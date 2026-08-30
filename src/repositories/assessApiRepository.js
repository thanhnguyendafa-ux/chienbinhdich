import { ensureAnonymousFirebaseUser, getFirebaseClient } from './firebaseClient.js';

export function createAssessApiRepository(project) {
  let clientPromise = null;
  const client = async () => {
    clientPromise ??= getFirebaseClient(project, 'student');
    return clientPromise;
  };

  async function token() {
    const firebase = await client();
    const user = await ensureAnonymousFirebaseUser(firebase);
    return user.getIdToken();
  }

  async function request(path, options = {}) {
    const idToken = await token();
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
        ...(options.headers ?? {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload?.message ?? 'Assess service unavailable.');
      error.code = payload?.code ?? 'assess_api_error';
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  return Object.freeze({
    getLesson(code) {
      return request(`/api/assess/lesson?code=${encodeURIComponent(code)}`, { method: 'GET' });
    },
    recordAttempt(payload) {
      return request('/api/assess/grade', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  });
}
