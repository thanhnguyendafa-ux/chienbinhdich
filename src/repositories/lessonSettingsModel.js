import { isValidEffortPassMinutes } from '../core/effortPassPolicy.js';
import { isValidPassThreshold } from '../core/masteryPolicy.js';
import { isValidTypingTolerance } from '../core/typingPolicy.js';

export function normalizeLessonSettingRecord(setId, data) {
  if (!data) return null;
  const hasPassThreshold = data.passThreshold !== undefined;
  const hasTypingTolerance = data.typingTolerance !== undefined;
  const hasEffortEnabled = data.effortPassEnabled !== undefined;
  const hasEffortMinutes = data.effortPassMinutes !== undefined;
  if (!hasPassThreshold && !hasTypingTolerance && !hasEffortEnabled && !hasEffortMinutes) {
    throw new Error(`Lesson setting ${setId} không có override hợp lệ.`);
  }
  if (hasPassThreshold && !isValidPassThreshold(data.passThreshold)) {
    throw new Error(`Lesson setting ${setId} có passThreshold không hợp lệ.`);
  }
  if (hasTypingTolerance && !isValidTypingTolerance(data.typingTolerance)) {
    throw new Error(`Lesson setting ${setId} có typingTolerance không hợp lệ.`);
  }
  if (hasEffortEnabled && typeof data.effortPassEnabled !== 'boolean') {
    throw new Error(`Lesson setting ${setId} có effortPassEnabled không hợp lệ.`);
  }
  if (hasEffortMinutes && !isValidEffortPassMinutes(data.effortPassMinutes)) {
    throw new Error(`Lesson setting ${setId} có effortPassMinutes không hợp lệ.`);
  }
  if (data.effortPassEnabled === true && !hasEffortMinutes) {
    throw new Error(`Lesson setting ${setId} bật Effort Timer nhưng thiếu effortPassMinutes.`);
  }

  const record = {
    setId: String(setId),
    updatedAt: finiteOrNull(data.updatedAt),
    updatedBy: data.updatedBy ? String(data.updatedBy) : null
  };
  if (hasPassThreshold) record.passThreshold = Number(data.passThreshold);
  if (hasTypingTolerance) record.typingTolerance = data.typingTolerance;
  if (hasEffortEnabled) record.effortPassEnabled = data.effortPassEnabled;
  if (hasEffortMinutes) record.effortPassMinutes = Number(data.effortPassMinutes);
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
  const hasEffortEnabled = normalizedOverrides.effortPassEnabled !== undefined;
  const hasEffortMinutes = normalizedOverrides.effortPassMinutes !== undefined;
  if (!hasPassThreshold && !hasTypingTolerance && !hasEffortEnabled && !hasEffortMinutes) {
    throw new Error('At least one lesson override is required.');
  }
  if (hasPassThreshold && !isValidPassThreshold(normalizedOverrides.passThreshold)) {
    throw new Error('passThreshold must be an integer from 1 to 100.');
  }
  if (hasTypingTolerance && !isValidTypingTolerance(normalizedOverrides.typingTolerance)) {
    throw new Error('typingTolerance must be boolean.');
  }
  if (hasEffortEnabled && typeof normalizedOverrides.effortPassEnabled !== 'boolean') {
    throw new Error('effortPassEnabled must be boolean.');
  }
  if (hasEffortMinutes && !isValidEffortPassMinutes(normalizedOverrides.effortPassMinutes)) {
    throw new Error('effortPassMinutes must be an integer from 5 to 60.');
  }
  if (normalizedOverrides.effortPassEnabled === true && !hasEffortMinutes) {
    throw new Error('effortPassMinutes is required when effortPassEnabled is true.');
  }

  const document = {};
  if (hasPassThreshold) document.passThreshold = Number(normalizedOverrides.passThreshold);
  if (hasTypingTolerance) document.typingTolerance = normalizedOverrides.typingTolerance;
  if (hasEffortEnabled) document.effortPassEnabled = normalizedOverrides.effortPassEnabled;
  if (hasEffortMinutes) document.effortPassMinutes = Number(normalizedOverrides.effortPassMinutes);
  document.updatedAt = Number(updatedAt);
  document.updatedBy = String(updatedBy);
  return Object.freeze(document);
}

export function lessonSettingOverrides(record) {
  const overrides = {};
  if (record?.passThreshold !== undefined) overrides.passThreshold = record.passThreshold;
  if (record?.typingTolerance !== undefined) overrides.typingTolerance = record.typingTolerance;
  if (record?.effortPassEnabled !== undefined) overrides.effortPassEnabled = record.effortPassEnabled;
  if (record?.effortPassMinutes !== undefined) overrides.effortPassMinutes = record.effortPassMinutes;
  return overrides;
}

function finiteOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}
