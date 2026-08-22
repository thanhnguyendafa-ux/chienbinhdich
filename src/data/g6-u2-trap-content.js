import { g6U2TrapSourceByKey } from './g6-u2-trap-source.js';
import { buildG6U2TrapLesson } from './g6-u2-trap-builder.js';
import { presentG6U2TrapForGrade4 } from './g6-u2-trap-grade4-presentation.js';

const cache = new Map();

export function getG6U2TrapContent(key) {
  const source = g6U2TrapSourceByKey[key];
  if (!source) throw new Error(`Unknown G6 U2 Trap lesson: ${key}`);
  if (!cache.has(key)) {
    const built = buildG6U2TrapLesson(source);
    cache.set(key, presentG6U2TrapForGrade4(built));
  }
  return cache.get(key);
}
