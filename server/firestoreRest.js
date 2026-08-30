export function createFirestoreRestClient(projectId, options = {}) {
  const resolvedProjectId = String(projectId ?? '').trim();
  if (!resolvedProjectId) throw new Error('Firestore projectId is required.');
  const fetchImpl = options.fetchImpl ?? fetch;
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(resolvedProjectId)}/databases/(default)/documents`;

  return Object.freeze({
    async getDocument(path, token) {
      const response = await fetchImpl(`${base}/${normalizePath(path)}`, {
        headers: authHeaders(token)
      });
      if (response.status === 404) return null;
      if (!response.ok) throw await firestoreRestError(response);
      return decodeDocument(await response.json());
    },

    async createDocument(collectionPath, documentId, data, token) {
      const url = `${base}/${normalizePath(collectionPath)}?documentId=${encodeURIComponent(String(documentId ?? ''))}`;
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          ...authHeaders(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: encodeMap(data) })
      });
      if (response.status === 409) throw restError('firestore_already_exists', 'Firestore document already exists.', 409);
      if (!response.ok) throw await firestoreRestError(response);
      return decodeDocument(await response.json());
    }
  });
}

function authHeaders(token) {
  const value = String(token ?? '').trim();
  if (!value) throw restError('auth_required', 'Firebase authentication is required.', 401);
  return { Authorization: `Bearer ${value}` };
}

function normalizePath(path) {
  return String(path ?? '')
    .split('/')
    .filter(Boolean)
    .map(segment => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');
}

async function firestoreRestError(response) {
  const body = await response.json().catch(() => ({}));
  const status = Number(response.status) || 500;
  const code = status === 401 ? 'auth_required'
    : status === 403 ? 'firestore_forbidden'
      : status === 404 ? 'firestore_not_found'
        : status === 429 ? 'firestore_quota_exceeded'
          : 'firestore_error';
  return restError(code, body?.error?.message ?? 'Firestore request failed.', status);
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

function decodeDocument(document) {
  return {
    ...decodeMap(document?.fields ?? {}),
    id: decodeURIComponent(String(document?.name ?? '').split('/').at(-1) ?? '')
  };
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

function restError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}
