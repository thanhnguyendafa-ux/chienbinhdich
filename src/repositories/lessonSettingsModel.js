import { isValidPassThreshold } from '../core/masteryPolicy.js';

export function normalizeLessonSettingRecord(setId, data) {
  if (!data) return null;
  if (!isValidPassThreshold(data.passThreshold)) {
    throw new Error(`Lesson setting ${setId} có passThreshold không hợp lệ.`);
  }
  return Object.freeze({
    setId: String(setId),
    passThreshold: Number(data.passThreshold),
    updatedAt: finiteOrNull(data.updatedAt),
    updatedBy: data.updatedBy ? String(data.updatedBy) : null
  });
}

export function lessonSettingDocumentFor(setId, passThreshold, updatedBy, updatedAt = Date.now()) {
  if (!String(setId ?? '').trim()) throw new Error('setId is required.');
  if (!isValidPassThreshold(passThreshold)) throw new Error('passThreshold must be an integer from 1 to 100.');
  if (!String(updatedBy ?? '').trim()) throw new Error('updatedBy is required.');
  if (!Number.isFinite(Number(updatedAt))) throw new Error('updatedAt must be finite.');

  return Object.freeze({
    passThreshold: Number(passThreshold),
    updatedAt: Number(updatedAt),
    updatedBy: String(updatedBy)
  });
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
