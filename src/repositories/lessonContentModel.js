function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function finiteInteger(value, fallback = null) {
  const numeric = Number(value);
  return Number.isInteger(numeric) ? numeric : fallback;
}

function cloneSerializable(value) {
  if (Array.isArray(value)) return value.map(cloneSerializable);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    if (nested === undefined || typeof nested === 'function') continue;
    output[key] = cloneSerializable(nested);
  }
  return output;
}

export function normalizeLessonContentRecord(setId, data) {
  if (!data) return null;
  const revision = finiteInteger(data.revision);
  const baseVersion = finiteInteger(data.baseVersion, 1);
  if (!String(setId ?? '').trim()) throw new Error('setId is required.');
  if (!nonEmpty(String(data.setId ?? setId))) throw new Error(`Lesson content ${setId} thiếu setId.`);
  if (String(data.setId ?? setId) !== String(setId)) throw new Error(`Lesson content ${setId} sai setId.`);
  if (!revision || revision < 1) throw new Error(`Lesson content ${setId} có revision không hợp lệ.`);
  if (!Array.isArray(data.items) || data.items.length === 0) throw new Error(`Lesson content ${setId} phải có items.`);

  return Object.freeze({
    setId: String(setId),
    revision,
    revisionId: nonEmpty(data.revisionId) ? String(data.revisionId) : revisionIdFor(revision),
    baseVersion,
    items: Object.freeze(data.items.map(item => Object.freeze(cloneSerializable(item)))),
    updatedAt: Number.isFinite(Number(data.updatedAt)) ? Number(data.updatedAt) : null,
    updatedBy: data.updatedBy ? String(data.updatedBy) : null
  });
}

export function lessonContentDocumentFor({ setId, revision, baseVersion = 1, items, updatedBy, updatedAt = Date.now() }) {
  if (!String(setId ?? '').trim()) throw new Error('setId is required.');
  if (!Number.isInteger(Number(revision)) || Number(revision) < 1) throw new Error('revision must be a positive integer.');
  if (!Array.isArray(items) || items.length === 0) throw new Error('items must be a non-empty array.');
  if (!String(updatedBy ?? '').trim()) throw new Error('updatedBy is required.');
  if (!Number.isFinite(Number(updatedAt))) throw new Error('updatedAt must be finite.');

  const normalizedRevision = Number(revision);
  return Object.freeze({
    setId: String(setId),
    revision: normalizedRevision,
    revisionId: revisionIdFor(normalizedRevision),
    baseVersion: Number.isInteger(Number(baseVersion)) ? Number(baseVersion) : 1,
    items: cloneSerializable(items),
    updatedAt: Number(updatedAt),
    updatedBy: String(updatedBy)
  });
}

export function revisionIdFor(revision) {
  return `r${String(Number(revision)).padStart(4, '0')}`;
}

export function cloneLessonItems(items) {
  return cloneSerializable(items ?? []);
}
