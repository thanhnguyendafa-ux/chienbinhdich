import { firebaseConfig } from '../src/config/firebaseConfig.js';

export async function verifyFirebaseIdToken(idToken) {
  const token = String(idToken ?? '').trim();
  if (!token) throw firebaseAuthError('auth_required', 'Firebase authentication is required.', 401);
  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.project.apiKey)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token })
  });
  const payload = await response.json().catch(() => ({}));
  const user = payload.users?.[0] ?? null;
  if (!response.ok || !user?.localId) {
    throw firebaseAuthError('auth_invalid', payload?.error?.message ?? 'Firebase authentication is invalid.', 401);
  }
  return Object.freeze({
    uid: String(user.localId),
    email: user.email ? String(user.email) : null,
    isAnonymous: !user.email
  });
}

function firebaseAuthError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}
