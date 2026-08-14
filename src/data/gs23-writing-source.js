import { gs23WritingSourcePart1 } from './gs23-writing-source-part1.js';
import { gs23WritingSourcePart2 } from './gs23-writing-source-part2.js';
import { gs23WritingSourcePart3 } from './gs23-writing-source-part3.js';
import { gs23WritingSourcePart4 } from './gs23-writing-source-part4.js';
import { gs23WritingSourcePart5 } from './gs23-writing-source-part5.js';
import { gs23WritingSourcePart6 } from './gs23-writing-source-part6.js';
import { gs23WritingSourcePart7 } from './gs23-writing-source-part7.js';
import { gs23WritingSourcePart8 } from './gs23-writing-source-part8.js';
import { gs23WritingScaffoldOverrides } from './gs23-writing-scaffold-overrides.js';

const rawUnits = { ...gs23WritingSourcePart1, ...gs23WritingSourcePart2, ...gs23WritingSourcePart3, ...gs23WritingSourcePart4, ...gs23WritingSourcePart5, ...gs23WritingSourcePart6, ...gs23WritingSourcePart7, ...gs23WritingSourcePart8 };

function freezePairs(pairs = []) {
  return Object.freeze(pairs.map(pair => Object.freeze([...pair])));
}

function normalizedRow(row) {
  const override = gs23WritingScaffoldOverrides[row.id] ?? {};
  return Object.freeze({
    ...row,
    ...override,
    words: freezePairs(override.words ?? row.words),
    phrases: freezePairs(override.phrases ?? row.phrases),
    ...(Array.isArray(row.acceptedAnswers) ? { acceptedAnswers: Object.freeze([...row.acceptedAnswers]) } : {})
  });
}

export const gs23WritingUnits = Object.freeze(Object.fromEntries(
  Object.entries(rawUnits).map(([unitId, unit]) => [unitId, Object.freeze({ ...unit, rows: Object.freeze(unit.rows.map(normalizedRow)) })])
));