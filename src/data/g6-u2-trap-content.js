import { g6U2TrapSourceByKey } from './g6-u2-trap-source.js';
import { buildG6U2TrapLesson } from './g6-u2-trap-builder.js';

const cache = new Map();

export function getG6U2TrapContent(key) {
  const source = g6U2TrapSourceByKey[key];
  if (!source) throw new Error(`Unknown G6 U2 Trap lesson: ${key}`);
  if (!cache.has(key)) cache.set(key, buildG6U2TrapLesson(source));
  return cache.get(key);
}
