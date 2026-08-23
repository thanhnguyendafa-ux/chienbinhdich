const SOURCE_ONLY = 'source-only';
const UNSCORED = 'unscored';

export function isScoredItem(set, item) {
  if (!item) return false;
  if (item.assessmentMode === UNSCORED) return false;
  if (set?.assessmentPolicy !== SOURCE_ONLY) return true;
  if (item.learningPhase !== 'source') return false;
  if (item.responseMode === 'open') return false;
  return true;
}

export function scoredItemCount(set) {
  return (set?.items ?? []).filter(item => isScoredItem(set, item)).length;
}

export function assessmentModeForItem(set, item) {
  return isScoredItem(set, item) ? 'scored' : UNSCORED;
}

export function withSourceOnlyWorkbookAssessment(descriptor) {
  return Object.freeze({
    ...descriptor,
    completionPolicy: 'all-items',
    assessmentPolicy: SOURCE_ONLY,
    assessmentLabel: 'Điểm SBT chỉ tính câu nguồn chấm tự động; từ vựng/cụm từ và bài mở chỉ hỗ trợ học.'
  });
}
