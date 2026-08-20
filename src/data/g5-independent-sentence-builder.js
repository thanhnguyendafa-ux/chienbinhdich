import { buildG5ExplainAcceptContent } from './g5-explain-accept-builder.js';

const freeze = Object.freeze;
const MAX_SCAFFOLDS = 6;

export function buildG5IndependentSentenceContent({ unitNumber, unitLabel, sourceGroups }) {
  const supportBank = collectSupportBank(sourceGroups);
  const seenTargets = new Set();
  const rawLessons = [];

  for (const [groupKey, , rows] of sourceGroups) {
    for (const [stage, scaffoldRole, vi, en] of rows) {
      if (stage !== 'sentence') continue;
      const targetKey = normalizeMatch(en);
      if (!targetKey || seenTargets.has(targetKey)) continue;
      seenTargets.add(targetKey);

      const supports = selectSupports({ supportBank, groupKey, targetEn: en });
      const lessonKey = String(rawLessons.length + 1).padStart(2, '0');
      rawLessons.push(freeze([
        lessonKey,
        safeVietnameseTitle(vi, rawLessons.length + 1),
        freeze([
          ...supports.map(row => freeze([...row])),
          freeze(['sentence', scaffoldRole, vi, en])
        ])
      ]));
    }
  }

  const built = buildG5ExplainAcceptContent({ unitNumber, unitLabel, raw: freeze(rawLessons) });
  return freeze({
    ...built,
    targetCount: rawLessons.length,
    sourceGroupCount: sourceGroups.length
  });
}

function collectSupportBank(sourceGroups) {
  const rows = [];
  for (const [groupKey, , groupRows] of sourceGroups) {
    for (const row of groupRows) {
      const [stage, scaffoldRole, vi, en] = row;
      if (!['word', 'phrase'].includes(stage)) continue;
      rows.push(freeze({ groupKey, stage, scaffoldRole, vi, en }));
    }
  }
  return freeze(rows);
}

function selectSupports({ supportBank, groupKey, targetEn }) {
  const targetNorm = normalizeMatch(targetEn);
  const targetTokens = new Set(targetNorm.split(' ').filter(Boolean));
  const scored = supportBank
    .map((candidate, index) => ({ candidate, index, score: supportScore(candidate, groupKey, targetNorm, targetTokens) }))
    .filter(entry => entry.score > 0);
  const local = scored.filter(entry => entry.candidate.groupKey === groupKey);
  const candidates = (local.length ? local : scored)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const chosen = [];
  const seenEnglish = new Set();
  for (const { candidate } of candidates) {
    const answerKey = normalizeMatch(candidate.en);
    if (!answerKey || seenEnglish.has(answerKey)) continue;
    seenEnglish.add(answerKey);
    chosen.push([candidate.stage, candidate.scaffoldRole, candidate.vi, candidate.en]);
    if (chosen.length >= MAX_SCAFFOLDS) break;
  }

  return chosen.sort((left, right) => {
    const stageDelta = stageRank(left[0]) - stageRank(right[0]);
    if (stageDelta) return stageDelta;
    return normalizeMatch(left[3]).length - normalizeMatch(right[3]).length;
  });
}

function supportScore(candidate, groupKey, targetNorm, targetTokens) {
  const supportNorm = normalizeMatch(candidate.en);
  if (!supportNorm) return 0;
  const supportTokens = supportNorm.split(' ').filter(Boolean);
  const exactSubstring = targetNorm.includes(supportNorm);
  const tokenSubset = supportTokens.every(token => targetTokens.has(token));
  if (!exactSubstring && !tokenSubset) return 0;

  let score = candidate.groupKey === groupKey ? 1000 : 0;
  score += candidate.stage === 'phrase' ? 250 : 100;
  score += Math.min(180, supportNorm.length * 3);
  if (exactSubstring) score += 120;
  return score;
}

function stageRank(stage) {
  return stage === 'word' ? 0 : stage === 'phrase' ? 1 : 2;
}

function normalizeMatch(value) {
  return String(value ?? '')
    .toLocaleLowerCase('en')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function safeVietnameseTitle(vi, order) {
  const clean = String(vi ?? '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/g, '');
  const shortened = clean.length > 72 ? `${clean.slice(0, 69).trim()}...` : clean;
  return shortened || `Câu đích ${String(order).padStart(2, '0')}`;
}
