import { validateSet } from '../../../data/contentValidator.js';

const STAGES = Object.freeze(['word', 'phrase', 'sentence']);

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en');
}

function surfaceContains(text, surface) {
  const haystack = normalize(text).replace(/[.,?!:;"'’\-]/g, ' ').replace(/\s+/g, ' ');
  const needle = normalize(surface).replace(/[.,?!:;"'’\-]/g, ' ').replace(/\s+/g, ' ');
  return Boolean(needle) && haystack.includes(needle);
}

function cleanAccepted(value) {
  if (Array.isArray(value)) return value.map(entry => String(entry).trim()).filter(Boolean);
  return String(value ?? '').split('\n').map(entry => entry.trim()).filter(Boolean);
}

function cloneItem(item) {
  const clone = structuredClone(item);
  if (clone.acceptedAnswers) clone.acceptedAnswers = cleanAccepted(clone.acceptedAnswers);
  return clone;
}

export function rebuildTypingDraftItems(items) {
  const normalized = (items ?? [])
    .map(cloneItem)
    .filter(item => STAGES.includes(item.stage))
    .sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage));
  const words = normalized.filter(item => item.stage === 'word');
  const phrases = normalized.filter(item => item.stage === 'phrase');

  return normalized.map(item => {
    const next = cloneItem(item);
    if (item.stage === 'word') next.buildsFrom = [];
    if (item.stage === 'phrase') {
      next.buildsFrom = words.filter(word => surfaceContains(item.en, word.en)).map(word => word.id);
    }
    if (item.stage === 'sentence') {
      next.buildsFrom = [
        ...words.filter(word => surfaceContains(item.en, word.en)).map(word => word.id),
        ...phrases.filter(phrase => surfaceContains(item.en, phrase.en)).map(phrase => phrase.id)
      ];
    }
    if (!next.acceptedAnswers?.length) delete next.acceptedAnswers;
    return next;
  });
}

export function validateTypingDraft(lesson, items) {
  const rebuilt = rebuildTypingDraftItems(items);
  return Object.freeze({
    items: Object.freeze(rebuilt.map(item => Object.freeze(item))),
    errors: Object.freeze(validateSet({ ...lesson, items: rebuilt }))
  });
}

export function createTypingDraftItem(lessonId, stage, index = 0) {
  const safeStage = STAGES.includes(stage) ? stage : 'word';
  const suffix = `${Date.now().toString(36)}-${index.toString(36)}`;
  return {
    id: `${lessonId}-admin-${safeStage}-${suffix}`,
    stage: safeStage,
    vi: '',
    en: '',
    buildsFrom: []
  };
}

export function stageLabel(stage) {
  return ({ word: 'WORD / CHUNK', phrase: 'PHRASE', sentence: 'SENTENCE' })[stage] ?? stage;
}
