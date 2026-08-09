import { resolveMasteryPolicy, sessionPassThreshold } from '../core/masteryPolicy.js';

export function applyLessonMasterySetting(lesson, setting = null) {
  if (!lesson) throw new Error('Lesson is required.');
  const masteryPolicy = resolveMasteryPolicy(lesson, setting);
  return Object.freeze({
    ...lesson,
    passThreshold: masteryPolicy.passThreshold,
    masteryPolicy
  });
}

export function applyLessonMasterySettings(lessons, settings = []) {
  const settingBySetId = new Map((settings ?? []).map(setting => [String(setting.setId), setting]));
  return (lessons ?? []).map(lesson => applyLessonMasterySetting(lesson, settingBySetId.get(String(lesson.id)) ?? null));
}

export function applySessionMasterySnapshot(lesson, session) {
  if (!lesson) throw new Error('Lesson is required.');
  const currentPolicy = lesson.masteryPolicy ?? resolveMasteryPolicy(lesson, null);
  const threshold = sessionPassThreshold(session, lesson);
  return Object.freeze({
    ...lesson,
    passThreshold: threshold,
    masteryPolicy: Object.freeze({
      ...currentPolicy,
      currentThreshold: Number(lesson.passThreshold),
      passThreshold: threshold,
      source: 'session-snapshot'
    })
  });
}
