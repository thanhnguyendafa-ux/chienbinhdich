import { buildG6ReviewU13LessonMap } from './g6-review-u1-3-builder.js';
import { G6_REVIEW_U13_LESSON_SPECS } from './g6-review-u1-3-specs.js';

const LESSONS = buildG6ReviewU13LessonMap(G6_REVIEW_U13_LESSON_SPECS);

export function getG6ReviewU13Content(key) {
  const content = LESSONS[key];
  if (!content) throw new Error(`Unknown G6 U1–3 review lesson: ${key}`);
  return content;
}

export const g6ReviewU13LessonKeys = Object.freeze(Object.keys(LESSONS));
