import { orderForExposure } from '../../../core/exposureOrder.js';

export function buildAnswerPositionPlan(items = [], { lessonId = '', lessonVersion = 1 } = {}) {
  const mcqs = items.filter(item => item?.type === 'mcq');
  const totals = countByChoiceCount(mcqs);
  const counts = new Map([...totals.keys()].map(choiceCount => [choiceCount, Array(choiceCount).fill(0)]));
  const plan = new Map();
  const memo = new Set();
  const seed = `print-answer-plan:${lessonId}:v${lessonVersion}`;

  if (!assignPositions({ mcqs, index: 0, totals, counts, plan, history: [], seed, memo })) {
    throw new Error(`Unable to build balanced print answer positions for lesson ${lessonId || '(unknown)'}.`);
  }
  return plan;
}

function assignPositions({ mcqs, index, totals, counts, plan, history, seed, memo }) {
  if (index >= mcqs.length) return true;
  const stateKey = memoKey(index, counts, history);
  if (memo.has(stateKey)) return false;

  const item = mcqs[index];
  const choiceCount = item.choices.length;
  const groupCounts = counts.get(choiceCount);
  const candidates = candidatePositions(choiceCount, groupCounts, `${seed}:${index}:${item.id}`);

  for (const position of candidates) {
    if (createsTriple(history, position)) continue;
    groupCounts[position] += 1;
    if (balanceStillReachable(groupCounts, totals.get(choiceCount))) {
      plan.set(String(item.id), position);
      history.push(position);
      if (assignPositions({ mcqs, index: index + 1, totals, counts, plan, history, seed, memo })) return true;
      history.pop();
      plan.delete(String(item.id));
    }
    groupCounts[position] -= 1;
  }

  memo.add(stateKey);
  return false;
}

function countByChoiceCount(items) {
  const totals = new Map();
  for (const item of items) {
    const choiceCount = Array.isArray(item.choices) ? item.choices.length : 0;
    if (choiceCount < 2) throw new Error(`MCQ ${item?.id ?? '(unknown)'} needs at least two choices for print planning.`);
    totals.set(choiceCount, (totals.get(choiceCount) ?? 0) + 1);
  }
  return totals;
}

function candidatePositions(choiceCount, groupCounts, seed) {
  const seeded = orderForExposure(Array.from({ length: choiceCount }, (_, index) => index), seed);
  const seededRank = new Map(seeded.map((position, index) => [position, index]));
  return seeded.slice().sort((a, b) => groupCounts[a] - groupCounts[b] || seededRank.get(a) - seededRank.get(b));
}

function balanceStillReachable(groupCounts, total) {
  const choiceCount = groupCounts.length;
  const floor = Math.floor(total / choiceCount);
  const ceil = Math.ceil(total / choiceCount);
  if (groupCounts.some(count => count > ceil)) return false;
  const assigned = groupCounts.reduce((sum, count) => sum + count, 0);
  const remaining = total - assigned;
  const deficitToFloor = groupCounts.reduce((sum, count) => sum + Math.max(0, floor - count), 0);
  return deficitToFloor <= remaining;
}

function createsTriple(history, position) {
  return history.length >= 2 && history.at(-1) === position && history.at(-2) === position;
}

function memoKey(index, counts, history) {
  const countState = [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([choiceCount, values]) => `${choiceCount}:${values.join(',')}`)
    .join('|');
  return `${index}|${history.at(-2) ?? '-'}:${history.at(-1) ?? '-'}|${countState}`;
}
