import { isValidPassThreshold } from '../core/masteryPolicy.js';
import { isValidTypingTolerance } from '../core/typingPolicy.js';

export function normalizeLessonSettingRecord(setId, data) {
  if (!data) return null;
  const hasPassThreshold = data.passThreshold !== undefined;
  const hasTypingTolerance = data.typingTolerance !== undefined;
  if (!hasPassThreshold && !hasTypingTolerance) {
    throw new Error(`Lesson setting ${setId} không có override hợp lệ.`);
  }
  if (hasPassThreshold && !isValidPassThreshold(data.passThreshold)) {
    throw new Error(`Lesson setting ${setId} có passThreshold không hợp lệ.`);
  }
  if (hasTypingTolerance && !isValidTypingTolerance(data.typingTolerance)) {
    throw new Error(`Lesson setting ${setId} có typingTolerance không hợp lệ.`);
  }

  const record = {
    setId: String(setId),
    updatedAt: finiteOrNull(data.updatedAt),
    updatedBy: data.updatedBy ? String(data.updatedBy) : null
  };
  if (hasPassThreshold) record.passThreshold = Number(data.passThreshold);
  if (hasTypingTolerance) record.typingTolerance = data.typingTolerance;
  return Object.freeze(record);
}

export function lessonSettingDocumentFor(setId, overrides, updatedBy, updatedAt = Date.now()) {
  if (!String(setId ?? '').trim()) throw new Error('setId is required.');
  if (!String(updatedBy ?? '').trim()) throw new Error('updatedBy is required.');
  if (!Number.isFinite(Number(updatedAt))) throw new Error('updatedAt must be finite.');

  const normalizedOverrides = typeof overrides === 'object' && overrides !== null
    ? overrides
    : { passThreshold: overrides };
  const hasPassThreshold = normalizedOverrides.passThreshold !== undefined;
  const hasTypingTolerance = normalizedOverrides.typingTolerance !== undefined;
  if (!hasPassThreshold && !hasTypingTolerance) throw new Error('At least one lesson override is required.');
  if (hasPassThreshold && !isValidPassThreshold(normalizedOverrides.passThreshold)) {
    throw new Error('passThreshold must be an integer from 1 to 100.');
  }
  if (hasTypingTolerance && !isValidTypingTolerance(normalizedOverrides.typingTolerance)) {
    throw new Error('typingTolerance must be boolean.');
  }

  const document = {};
  if (hasPassThreshold) document.passThreshold = Number(normalizedOverrides.passThreshold);
  if (hasTypingTolerance) document.typingTolerance = normalizedOverrides.typingTolerance;
  document.updatedAt = Number(updatedAt);
  document.updatedBy = String(updatedBy);
  return Object.freeze(document);
}

export function lessonSettingOverrides(record) {
  const overrides = {};
  if (record?.passThreshold !== undefined) overrides.passThreshold = record.passThreshold;
  if (record?.typingTolerance !== undefined) overrides.typingTolerance = record.typingTolerance;
  return overrides;
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
