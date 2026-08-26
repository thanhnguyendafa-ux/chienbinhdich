import { freeze, sentenceOrder } from '../../../workbook-content-helpers.js';
import { defineG6WorkbookLesson as defineLegacyG6WorkbookLesson } from './workbook-lesson.js';

export const G6_LONG_TYPING_MIN_WORDS = 5;

function answerTokens(answer) {
  return String(answer ?? '').trim().split(/\s+/).filter(Boolean);
}

function isUnscoredTyping(item) {
  return item?.assessmentMode === 'unscored' || item?.responseMode === 'open';
}

export function isLongScoredTypingItem(item) {
  return item?.type === 'typing' && !isUnscoredTyping(item) && answerTokens(item.en).length >= G6_LONG_TYPING_MIN_WORDS;
}

function adaptLongTyping(item) {
  if (!isLongScoredTypingItem(item)) return item;

  const correctOrder = answerTokens(item.en);
  const feedback = item.teachingFeedback ?? {};
  const ordered = sentenceOrder({
    id: item.id,
    prompt: item.vi || 'Sắp xếp các từ/cụm thành câu đúng.',
    tokens: correctOrder,
    correctOrder,
    reason: feedback.reason || 'Đáp án nguồn là một câu dài. Bản online giữ nguyên câu đích nhưng chuyển sang sắp xếp từ để tránh chấm oan do lỗi gõ dài.',
    theory: feedback.theory || 'Sắp xếp từ theo đúng cấu trúc câu trong bài SBT.',
    example: feedback.example || item.en,
    phase: item.learningPhase || 'source',
    adaptation: {
      kind: 'long_typing_to_sentence_order',
      sourceType: 'typing',
      thresholdWords: G6_LONG_TYPING_MIN_WORDS,
      reason: 'Canonical scored typing answers of 5+ words are converted to sentence_order. Open/unscored writing remains open typing.'
    }
  });

  return freeze({
    ...ordered,
    ...(item.stimulus ? { stimulus: item.stimulus } : {}),
    sourceInteractionType: 'typing'
  });
}

export function defineG6WorkbookLesson(spec) {
  const legacy = defineLegacyG6WorkbookLesson(spec);
  return freeze({
    ...legacy,
    items: freeze(legacy.items.map(adaptLongTyping))
  });
}
