import { gs23WritingUnits } from './gs23-writing-source.js';

const MAX_TYPED_SENTENCES = 2;
const MAX_ESTIMATED_BASE_MINUTES = 16;
const EXPECTED_TIME_MINUTES = 15;

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en');
}

function uniquePairs(pairs) {
  const seen = new Set();
  const output = [];
  for (const pair of pairs) {
    const key = normalize(pair?.[1]);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(Object.freeze([String(pair[0]), String(pair[1])]));
  }
  return output;
}

function containsSurface(text, surface) {
  return normalize(text).includes(normalize(surface));
}

function atomicGroups(unit) {
  const grouped = new Set();
  const groups = [];
  for (const row of unit.rows) {
    if (grouped.has(row.id)) continue;
    if ((row.mode === 'pair' || row.mode === 'reuse') && row.contextSourceId) continue;
    const members = [row];
    grouped.add(row.id);
    for (const child of unit.rows) {
      if (child.contextSourceId !== row.id || !['pair', 'reuse'].includes(child.mode)) continue;
      members.push(child);
      grouped.add(child.id);
    }
    groups.push(Object.freeze(members));
  }
  for (const row of unit.rows) {
    if (grouped.has(row.id)) continue;
    groups.push(Object.freeze([row]));
    grouped.add(row.id);
  }
  return Object.freeze(groups);
}

function lessonStats(groups, grade) {
  const rows = groups.flat();
  const typedRows = rows.filter(row => row.mode !== 'reuse');
  const words = uniquePairs(typedRows.flatMap(row => row.words ?? []));
  const phrases = uniquePairs(typedRows.flatMap(row => row.phrases ?? []));
  const sentenceCount = typedRows.length;
  const sentenceMinutes = grade === 2 ? 2 : 2.2;
  const estimated = (1.5 + words.length * 0.65 + phrases.length * 1.05 + sentenceCount * sentenceMinutes) * 1.25;
  return Object.freeze({
    wordCount: words.length,
    phraseCount: phrases.length,
    sentenceCount,
    itemCount: words.length + phrases.length + sentenceCount,
    estimatedBaseMinutes: Math.round(estimated * 10) / 10
  });
}

export function planGs23Unit(unitId) {
  const unit = gs23WritingUnits[unitId];
  if (!unit) throw new Error(`Unknown GS2/3 writing unit: ${unitId}`);
  const groups = atomicGroups(unit);
  const lessons = [];
  let current = [];

  for (const group of groups) {
    if (!current.length) {
      current = [group];
      continue;
    }
    const candidate = [...current, group];
    const stats = lessonStats(candidate, unit.grade);
    if (stats.sentenceCount <= MAX_TYPED_SENTENCES && stats.estimatedBaseMinutes <= MAX_ESTIMATED_BASE_MINUTES) {
      current = candidate;
      continue;
    }
    lessons.push(current);
    current = [group];
  }
  if (current.length) lessons.push(current);

  return Object.freeze(lessons.map((groupsForLesson, index) => {
    const rows = groupsForLesson.flat();
    const typedRows = rows.filter(row => row.mode !== 'reuse');
    const reusedRows = rows.filter(row => row.mode === 'reuse');
    return Object.freeze({
      key: `${unitId.toLowerCase()}-${String(index + 1).padStart(2, '0')}`,
      unitId,
      lessonNumber: index + 1,
      rows: Object.freeze(rows),
      typedRows: Object.freeze(typedRows),
      reusedRows: Object.freeze(reusedRows),
      sourceSentenceIds: Object.freeze(rows.map(row => row.id)),
      typedSourceSentenceIds: Object.freeze(typedRows.map(row => row.id)),
      reusedSourceSentenceIds: Object.freeze(reusedRows.map(row => row.id)),
      stats: lessonStats(groupsForLesson, unit.grade)
    });
  }));
}

export const gs23WritingPlans = Object.freeze(Object.fromEntries(
  Object.keys(gs23WritingUnits).map(unitId => [unitId, planGs23Unit(unitId)])
));

function typingItem(id, stage, vi, en, buildsFrom = [], extra = {}) {
  return Object.freeze({
    id,
    stage,
    vi,
    en,
    buildsFrom: Object.freeze([...buildsFrom]),
    ...extra,
    ...(Array.isArray(extra.acceptedAnswers) ? { acceptedAnswers: Object.freeze([...extra.acceptedAnswers]) } : {})
  });
}

function parentRow(unit, row) {
  if (!row.contextSourceId) return null;
  return unit.rows.find(candidate => candidate.id === row.contextSourceId) ?? null;
}

export function buildGs23WritingLesson(unitId, lessonNumber) {
  const unit = gs23WritingUnits[unitId];
  const spec = gs23WritingPlans[unitId]?.[lessonNumber - 1];
  if (!unit || !spec) throw new Error(`Unknown GS2/3 writing lesson: ${unitId}#${lessonNumber}`);

  const words = uniquePairs(spec.typedRows.flatMap(row => row.words ?? []));
  const phrases = uniquePairs(spec.typedRows.flatMap(row => row.phrases ?? []));
  const items = [];
  const wordIds = new Map();
  const phraseIds = new Map();
  const lessonKey = spec.key;

  words.forEach(([vi, en], index) => {
    const id = `${lessonKey}-w${index + 1}`;
    wordIds.set(normalize(en), id);
    items.push(typingItem(id, 'word', vi, en));
  });

  phrases.forEach(([vi, en], index) => {
    const id = `${lessonKey}-p${index + 1}`;
    const dependencies = words
      .filter(([, wordEn]) => containsSurface(en, wordEn))
      .map(([, wordEn]) => wordIds.get(normalize(wordEn)))
      .filter(Boolean);
    phraseIds.set(normalize(en), id);
    items.push(typingItem(id, 'phrase', vi, en, dependencies));
  });

  spec.typedRows.forEach((row, index) => {
    const parent = parentRow(unit, row);
    const phraseDependencies = phrases
      .filter(([, phraseEn]) => containsSurface(row.en, phraseEn))
      .map(([, phraseEn]) => phraseIds.get(normalize(phraseEn)))
      .filter(Boolean);
    const wordDependencies = words
      .filter(([, wordEn]) => containsSurface(row.en, wordEn))
      .map(([, wordEn]) => wordIds.get(normalize(wordEn)))
      .filter(Boolean);
    const dependencies = [...new Set([...wordDependencies, ...phraseDependencies])];
    const extra = {
      sourceSentenceId: row.id,
      sourceLayer: row.layer,
      sourceRole: row.role,
      typingMode: row.mode,
      ...(parent ? { contextVi: parent.vi } : {}),
      ...(row.acceptedAnswers?.length ? { acceptedAnswers: row.acceptedAnswers } : {})
    };
    items.push(typingItem(`${lessonKey}-s${index + 1}`, 'sentence', row.vi, row.en, dependencies, extra));
  });

  return Object.freeze({
    items: Object.freeze(items),
    meta: Object.freeze({
      unitId,
      lessonNumber,
      expectedTimeMinutes: EXPECTED_TIME_MINUTES,
      ...spec.stats,
      sourceSentenceIds: spec.sourceSentenceIds,
      typedSourceSentenceIds: spec.typedSourceSentenceIds,
      reusedSourceSentenceIds: spec.reusedSourceSentenceIds
    })
  });
}

export function getGs23WritingLesson(unitId, lessonNumber) {
  return buildGs23WritingLesson(unitId, lessonNumber);
}

export function listGs23WritingLessonSpecs() {
  return Object.freeze(Object.values(gs23WritingPlans).flat());
}
