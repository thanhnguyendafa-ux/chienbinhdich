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
  if (data.passages !== undefined && !Array.isArray(data.passages)) throw new Error(`Lesson content ${setId} passages phải là mảng.`);
  if (data.printGroups !== undefined && !Array.isArray(data.printGroups)) throw new Error(`Lesson content ${setId} printGroups phải là mảng.`);

  const record = {
    setId: String(setId),
    revision,
    revisionId: nonEmpty(data.revisionId) ? String(data.revisionId) : revisionIdFor(revision),
    baseVersion,
    active: data.active !== false,
    items: Object.freeze(data.items.map(item => Object.freeze(cloneSerializable(item)))),
    updatedAt: Number.isFinite(Number(data.updatedAt)) ? Number(data.updatedAt) : null,
    updatedBy: data.updatedBy ? String(data.updatedBy) : null
  };
  if (data.passages !== undefined) record.passages = Object.freeze(data.passages.map(value => Object.freeze(cloneSerializable(value))));
  if (data.printGroups !== undefined) record.printGroups = Object.freeze(data.printGroups.map(value => Object.freeze(cloneSerializable(value))));
  return Object.freeze(record);
}

export function lessonContentDocumentFor({
  setId,
  revision,
  baseVersion = 1,
  items,
  passages,
  printGroups,
  updatedBy,
  updatedAt = Date.now(),
  active = true
}) {
  if (!String(setId ?? '').trim()) throw new Error('setId is required.');
  if (!Number.isInteger(Number(revision)) || Number(revision) < 1) throw new Error('revision must be a positive integer.');
  if (!Array.isArray(items) || items.length === 0) throw new Error('items must be a non-empty array.');
  if (passages !== undefined && !Array.isArray(passages)) throw new Error('passages must be an array when supplied.');
  if (printGroups !== undefined && !Array.isArray(printGroups)) throw new Error('printGroups must be an array when supplied.');
  if (!String(updatedBy ?? '').trim()) throw new Error('updatedBy is required.');
  if (!Number.isFinite(Number(updatedAt))) throw new Error('updatedAt must be finite.');

  const normalizedRevision = Number(revision);
  const document = {
    setId: String(setId),
    revision: normalizedRevision,
    revisionId: revisionIdFor(normalizedRevision),
    baseVersion: Number.isInteger(Number(baseVersion)) ? Number(baseVersion) : 1,
    active: active !== false,
    items: cloneSerializable(items),
    updatedAt: Number(updatedAt),
    updatedBy: String(updatedBy)
  };
  if (passages !== undefined) document.passages = cloneSerializable(passages);
  if (printGroups !== undefined) document.printGroups = cloneSerializable(printGroups);
  return Object.freeze(document);
}

export function revisionIdFor(revision) {
  return `r${String(Number(revision)).padStart(4, '0')}`;
}

export function cloneLessonItems(items) {
  return cloneSerializable(items ?? []);
}

export function cloneLessonContent(content = {}) {
  const output = { items: cloneSerializable(content.items ?? []) };
  if (content.passages !== undefined) output.passages = cloneSerializable(content.passages);
  if (content.printGroups !== undefined) output.printGroups = cloneSerializable(content.printGroups);
  return output;
}
