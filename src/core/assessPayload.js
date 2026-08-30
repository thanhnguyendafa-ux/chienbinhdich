import { assessableItems } from './assessScoringPolicy.js';
import { questionTypeForItem } from './questionTypes.js';

const FORBIDDEN_KEYS = new Set([
  'en',
  'acceptedAnswers',
  'correctChoiceId',
  'answer',
  'correctOrder',
  'acceptedOrders',
  'correctGroupId',
  'expectedAnswer',
  'answerKey',
  'sampleAnswer',
  'modelAnswer',
  'teachingFeedback',
  'theorySupport',
  'preLessonTheory',
  'explanation'
]);

export function sanitizeAssessLesson(set) {
  const items = assessableItems(set).map(sanitizeAssessItem);
  const usedPassageIds = new Set(items.map(item => item.passageId).filter(Boolean).map(String));
  const passages = (set?.passages ?? [])
    .filter(passage => usedPassageIds.has(String(passage.id)))
    .map(value => deepSanitize(value));

  return Object.freeze({
    id: String(set.id),
    version: Number(set.version ?? 1),
    title: String(set.title ?? ''),
    course: String(set.course ?? ''),
    unit: String(set.unit ?? ''),
    activityTypes: Object.freeze([...(set.activityTypes ?? [])]),
    assessmentPolicy: set.assessmentPolicy ?? null,
    assessmentContractVersion: set.assessmentContractVersion ?? null,
    completionPolicy: set.completionPolicy ?? null,
    typingTolerance: set.typingTolerance === true,
    itemCount: items.length,
    items: Object.freeze(items),
    ...(passages.length ? { passages: Object.freeze(passages) } : {})
  });
}

export function sanitizeAssessItem(item) {
  const type = questionTypeForItem(item);
  const safe = deepSanitize(item);

  if (type === 'sentence_order') {
    const sourceOrder = Array.isArray(item.tokens) && item.tokens.length
      ? item.tokens
      : Array.isArray(item.correctOrder)
        ? item.correctOrder
        : [];
    if (!Array.isArray(safe.tokens) || !safe.tokens.length) {
      safe.tokens = scrambleWithoutAnswerOrder(sourceOrder, String(item.id));
    }
  }

  if (Array.isArray(safe.tokens)) {
    safe.tokens = safe.tokens.map(token => {
      if (!token || typeof token !== 'object' || Array.isArray(token)) return token;
      const copy = { ...token };
      delete copy.correctGroupId;
      return copy;
    });
  }

  return Object.freeze(safe);
}

export function containsAssessAnswerKey(payload) {
  return findForbiddenKey(payload) !== null;
}

function deepSanitize(value) {
  if (Array.isArray(value)) return value.map(deepSanitize);
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    output[key] = deepSanitize(child);
  }
  return output;
}

function findForbiddenKey(value, path = '') {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const match = findForbiddenKey(value[index], `${path}[${index}]`);
      if (match) return match;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key) || key === 'correctGroupId') return `${path}.${key}`;
    const match = findForbiddenKey(child, `${path}.${key}`);
    if (match) return match;
  }
  return null;
}

function scrambleWithoutAnswerOrder(values, seed) {
  const copy = [...values];
  if (copy.length <= 1) return copy;
  const shift = 1 + (hash(seed) % (copy.length - 1));
  return copy.slice(shift).concat(copy.slice(0, shift));
}

function hash(value) {
  let result = 2166136261;
  for (const char of String(value)) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}
