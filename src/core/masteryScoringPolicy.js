import {
  MASTERY_MODE_COMPLETION,
  WORKBOOK_ALL_ITEMS_ASSESSMENT
} from './assessmentPolicy.js';

export const REVERSIBLE_MASTERY_CONTRACT_VERSION = 2;
const HISTORICAL_WORKBOOK_EARNED_ONLY_VERSION = 1;

export function masteryDeltaForAttempt({
  assessmentSet,
  masteryMode,
  result,
  attemptNumber,
  itemAttempts = []
}) {
  if (masteryMode === MASTERY_MODE_COMPLETION) {
    const alreadyEarned = itemAttempts.some(attempt => Number(attempt.masteryDeltaUnits ?? 0) > 0);
    return result.correct && !alreadyEarned ? 1 : 0;
  }

  if (usesHistoricalWorkbookEarnedOnlyLaw(assessmentSet)) {
    return attemptNumber === 1 && result.correct ? 1 : 0;
  }

  return attemptNumber === 1 ? (result.correct ? 1 : -1) : 0;
}

export function usesHistoricalWorkbookEarnedOnlyLaw(assessmentSet) {
  return assessmentSet?.assessmentPolicy === WORKBOOK_ALL_ITEMS_ASSESSMENT
    && Number(assessmentSet?.assessmentContractVersion ?? 0) === HISTORICAL_WORKBOOK_EARNED_ONLY_VERSION;
}
