import { resolveEffortPassPolicy, sessionEffortPassPolicy } from '../core/effortPassPolicy.js';
import { resolveMasteryPolicy, sessionPassThreshold } from '../core/masteryPolicy.js';
import { resolveTypingPolicy, sessionTypingTolerance } from '../core/typingPolicy.js';

export function applyLessonContentOverride(lesson, content = null) {
  if (!lesson) throw new Error('Lesson is required.');
  const defaultPolicy = Object.freeze({
    source: 'base',
    revision: 0,
    revisionId: null,
    baseVersion: Number(lesson.version ?? 1),
    updatedAt: null,
    updatedBy: null
  });
  if (!content) {
    return Object.freeze({ ...lesson, contentPolicy: defaultPolicy });
  }
  const overridden = {
    ...lesson,
    items: Object.freeze(content.items.map(item => Object.freeze(structuredClone(item)))),
    itemCount: content.items.length,
    contentPolicy: Object.freeze({
      source: 'admin-override',
      revision: Number(content.revision),
      revisionId: content.revisionId ?? null,
      baseVersion: Number(content.baseVersion ?? lesson.version ?? 1),
      updatedAt: content.updatedAt ?? null,
      updatedBy: content.updatedBy ?? null,
      baseChanged: Number(content.baseVersion ?? 1) !== Number(lesson.version ?? 1)
    })
  };
  if (content.passages !== undefined) {
    overridden.passages = Object.freeze(content.passages.map(value => Object.freeze(structuredClone(value))));
  }
  if (content.printGroups !== undefined) {
    overridden.printGroups = Object.freeze(content.printGroups.map(value => Object.freeze(structuredClone(value))));
  }
  return Object.freeze(overridden);
}

export function applyLessonMasterySetting(lesson, setting = null) {
  if (!lesson) throw new Error('Lesson is required.');
  const masteryPolicy = resolveMasteryPolicy(lesson, setting);
  const typingPolicy = resolveTypingPolicy(lesson, setting);
  const effortPassPolicy = resolveEffortPassPolicy(lesson, setting);
  return Object.freeze({
    ...lesson,
    passThreshold: masteryPolicy.passThreshold,
    masteryPolicy,
    typingTolerance: typingPolicy.typingTolerance,
    typingPolicy,
    effortPassEnabled: effortPassPolicy.enabled,
    effortPassMinutes: effortPassPolicy.minutes,
    effortPassPolicy
  });
}

export function applyLessonMasterySettings(lessons, settings = []) {
  const settingBySetId = new Map((settings ?? []).map(setting => [String(setting.setId), setting]));
  return (lessons ?? []).map(lesson => applyLessonMasterySetting(lesson, settingBySetId.get(String(lesson.id)) ?? null));
}

export function applySessionMasterySnapshot(lesson, session) {
  if (!lesson) throw new Error('Lesson is required.');
  const currentMasteryPolicy = lesson.masteryPolicy ?? resolveMasteryPolicy(lesson, null);
  const currentTypingPolicy = lesson.typingPolicy ?? resolveTypingPolicy(lesson, null);
  const currentEffortPolicy = lesson.effortPassPolicy ?? resolveEffortPassPolicy(lesson, null);
  const threshold = sessionPassThreshold(session, lesson);
  const typingTolerance = sessionTypingTolerance(session, lesson);
  const effort = sessionEffortPassPolicy(session, lesson);
  return Object.freeze({
    ...lesson,
    passThreshold: threshold,
    typingTolerance,
    effortPassEnabled: effort.enabled,
    effortPassMinutes: effort.minutes,
    masteryPolicy: Object.freeze({
      ...currentMasteryPolicy,
      currentThreshold: Number(lesson.passThreshold),
      passThreshold: threshold,
      source: 'session-snapshot'
    }),
    typingPolicy: Object.freeze({
      ...currentTypingPolicy,
      currentTypingTolerance: lesson.typingTolerance === true,
      typingTolerance,
      source: 'session-snapshot'
    }),
    effortPassPolicy: Object.freeze({
      ...currentEffortPolicy,
      currentEnabled: lesson.effortPassEnabled === true,
      currentMinutes: Number(lesson.effortPassMinutes),
      enabled: effort.enabled,
      minutes: effort.minutes,
      targetMs: effort.targetMs,
      source: 'session-snapshot'
    })
  });
}
