export const SOURCE_ONLY_ASSESSMENT = 'source-only';
export const WORKBOOK_ALL_ITEMS_ASSESSMENT = 'workbook-all-items-v1';
export const MASTERY_MODE_ACCURACY = 'accuracy';
export const MASTERY_MODE_COMPLETION = 'completion';
const UNSCORED = 'unscored';
const EXPLAIN_ACCEPT_POLICY = 'explain-and-accept';

export function masteryModeForItem(set, item) {
  if (!item) return MASTERY_MODE_ACCURACY;
  if (item.masteryMode === MASTERY_MODE_COMPLETION) return MASTERY_MODE_COMPLETION;
  if (item.masteryMode === MASTERY_MODE_ACCURACY) return MASTERY_MODE_ACCURACY;
  if (set?.assessmentPolicy === WORKBOOK_ALL_ITEMS_ASSESSMENT) {
    if (item.responseMode === 'open' || item.assessmentMode === UNSCORED) return MASTERY_MODE_COMPLETION;
  }
  return MASTERY_MODE_ACCURACY;
}

export function isScoredItem(set, item) {
  if (!item) return false;
  if (set?.assessmentPolicy === WORKBOOK_ALL_ITEMS_ASSESSMENT) return true;
  if (item.assessmentMode === UNSCORED || item.legacyAssessmentMode === UNSCORED) return false;
  if (set?.assessmentPolicy !== SOURCE_ONLY_ASSESSMENT) return true;
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
    assessmentPolicy: SOURCE_ONLY_ASSESSMENT,
    assessmentLabel: 'Điểm SBT chỉ tính câu nguồn chấm tự động; từ vựng/cụm từ và bài mở chỉ hỗ trợ học.'
  });
}

export function withWorkbookAllItemsMastery(descriptor) {
  const baseLoadContent = descriptor.loadContent;
  return Object.freeze({
    ...descriptor,
    completionPolicy: 'all-items',
    assessmentPolicy: WORKBOOK_ALL_ITEMS_ASSESSMENT,
    assessmentContractVersion: 1,
    assessmentLabel: 'Mastery tính tất cả câu trong bài: câu có đáp án tính theo độ chính xác; bài mở/tự luyện tính khi hoàn thành.',
    loadContent: async () => normalizeWorkbookContent(await baseLoadContent())
  });
}

export function assessmentSetForSession(session, set) {
  const snapshotPolicy = session?.assessmentPolicyAtStart;
  const snapshotCompletion = session?.completionPolicyAtStart;
  if (snapshotPolicy || snapshotCompletion) {
    return {
      ...set,
      assessmentPolicy: snapshotPolicy ?? set?.assessmentPolicy,
      completionPolicy: snapshotCompletion ?? set?.completionPolicy
    };
  }

  if (Number(session?.schemaVersion ?? 0) <= 7 && set?.assessmentPolicy === WORKBOOK_ALL_ITEMS_ASSESSMENT) {
    const id = String(session?.setId ?? set?.id ?? '');
    if (/^g[56]-u\d{1,2}-wb-/.test(id)) {
      return { ...set, assessmentPolicy: SOURCE_ONLY_ASSESSMENT, completionPolicy: 'all-items' };
    }
    if (/^g7-u\d{1,2}-wb-/.test(id)) {
      return { ...set, assessmentPolicy: null, completionPolicy: EXPLAIN_ACCEPT_POLICY };
    }
  }

  return set;
}

function normalizeWorkbookContent(content) {
  const items = (content?.items ?? []).map(item => {
    const masteryMode = item.masteryMode === MASTERY_MODE_COMPLETION
      || item.responseMode === 'open'
      || item.assessmentMode === UNSCORED
      ? MASTERY_MODE_COMPLETION
      : MASTERY_MODE_ACCURACY;
    const completion = masteryMode === MASTERY_MODE_COMPLETION;
    const open = item.responseMode === 'open';
    const typingUi = completion && item.typingUi
      ? Object.freeze({
          ...item.typingUi,
          instruction: open
            ? 'Tự viết câu trả lời của con. Bài mở có nhiều cách hợp lý; khi con gửi câu trả lời không trống, câu này được ghi nhận hoàn thành và tính 1 Mastery unit.'
            : 'Đọc/luyện theo hướng dẫn rồi xác nhận hoàn thành. Hệ thống không chấm giọng nói; câu này tính 1 Mastery unit khi con hoàn thành.'
        })
      : item.typingUi;
    const teachingFeedback = completion && item.teachingFeedback
      ? Object.freeze({
          ...item.teachingFeedback,
          correctLabel: 'Hoàn thành · +1 Mastery',
          reason: open
            ? 'Đây là bài mở nên có nhiều cách trả lời hợp lý. Hệ thống không giả chấm đúng/sai nội dung tự do; câu này nhận 1 Mastery unit khi con hoàn thành câu trả lời.'
            : 'Đây là bài tự luyện. Hệ thống không chấm âm thanh; xác nhận hoàn thành giúp câu này nhận 1 Mastery unit.'
        })
      : item.teachingFeedback;
    return Object.freeze({
      ...item,
      ...(item.assessmentMode === UNSCORED ? { legacyAssessmentMode: UNSCORED } : {}),
      assessmentMode: 'scored',
      masteryMode,
      ...(typingUi ? { typingUi } : {}),
      ...(teachingFeedback ? { teachingFeedback } : {})
    });
  });
  return Object.freeze({ ...content, items: Object.freeze(items) });
}
