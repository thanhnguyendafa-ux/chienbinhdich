import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MASTERY_MODE_ACCURACY,
  MASTERY_MODE_COMPLETION,
  WORKBOOK_ALL_ITEMS_ASSESSMENT
} from '../src/core/assessmentPolicy.js';
import { masteryDeltaForAttempt, usesHistoricalWorkbookEarnedOnlyLaw } from '../src/core/masteryScoringPolicy.js';

const currentWorkbook = { assessmentPolicy: WORKBOOK_ALL_ITEMS_ASSESSMENT, assessmentContractVersion: 2 };
const historicalWorkbook = { assessmentPolicy: WORKBOOK_ALL_ITEMS_ASSESSMENT, assessmentContractVersion: 1 };

test('current accuracy Mastery has one reversible law: first correct +1, first wrong -1, correction 0', () => {
  assert.equal(masteryDeltaForAttempt({ assessmentSet: currentWorkbook, masteryMode: MASTERY_MODE_ACCURACY, result: { correct: true }, attemptNumber: 1 }), 1);
  assert.equal(masteryDeltaForAttempt({ assessmentSet: currentWorkbook, masteryMode: MASTERY_MODE_ACCURACY, result: { correct: false }, attemptNumber: 1 }), -1);
  assert.equal(masteryDeltaForAttempt({ assessmentSet: currentWorkbook, masteryMode: MASTERY_MODE_ACCURACY, result: { correct: true }, attemptNumber: 2 }), 0);
  assert.equal(masteryDeltaForAttempt({ assessmentSet: {}, masteryMode: MASTERY_MODE_ACCURACY, result: { correct: false }, attemptNumber: 1 }), -1);
});

test('completion Mastery is 0/+1 and never invents a wrong-answer loss', () => {
  assert.equal(masteryDeltaForAttempt({ assessmentSet: currentWorkbook, masteryMode: MASTERY_MODE_COMPLETION, result: { correct: false }, attemptNumber: 1 }), 0);
  assert.equal(masteryDeltaForAttempt({ assessmentSet: currentWorkbook, masteryMode: MASTERY_MODE_COMPLETION, result: { correct: true }, attemptNumber: 1 }), 1);
  assert.equal(masteryDeltaForAttempt({ assessmentSet: currentWorkbook, masteryMode: MASTERY_MODE_COMPLETION, result: { correct: true }, attemptNumber: 2, itemAttempts: [{ masteryDeltaUnits: 1 }] }), 0);
});

test('contract v1 is a centralized historical adapter, not a second current scoring path', () => {
  assert.equal(usesHistoricalWorkbookEarnedOnlyLaw(historicalWorkbook), true);
  assert.equal(usesHistoricalWorkbookEarnedOnlyLaw(currentWorkbook), false);
  assert.equal(masteryDeltaForAttempt({ assessmentSet: historicalWorkbook, masteryMode: MASTERY_MODE_ACCURACY, result: { correct: false }, attemptNumber: 1 }), 0);
  assert.equal(masteryDeltaForAttempt({ assessmentSet: historicalWorkbook, masteryMode: MASTERY_MODE_ACCURACY, result: { correct: true }, attemptNumber: 1 }), 1);
});
