import { buildG7ReviewU13LessonMap } from './g7-review-u1-3-builder.js';
import { G7_REVIEW_U13_LESSON_SPECS } from './g7-review-u1-3-specs.js';

const LESSONS = buildG7ReviewU13LessonMap(G7_REVIEW_U13_LESSON_SPECS);

export function getG7ReviewU13Content(key) {
  const content = LESSONS[key];
  if (!content) throw new Error(`Unknown G7 U1–3 review lesson: ${key}`);
  return content;
}

export const g7ReviewU13LessonKeys = Object.freeze(Object.keys(LESSONS));
