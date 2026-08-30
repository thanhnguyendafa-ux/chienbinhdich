import {
  isScoredItem,
  masteryModeForItem,
  MASTERY_MODE_ACCURACY
} from './assessmentPolicy.js';
import { questionTypeForItem, SUPPORTED_QUESTION_TYPES } from './questionTypes.js';

export const CURRENT_ASSESS_SCORING_CONTRACT_VERSION = 1;

export function isAssessableItem(set, item) {
  if (!item || !isScoredItem(set, item)) return false;
  if (masteryModeForItem(set, item) !== MASTERY_MODE_ACCURACY) return false;
  if (item.responseMode === 'open') return false;
  return SUPPORTED_QUESTION_TYPES.includes(questionTypeForItem(item));
}

export function assessableItems(set) {
  return (set?.items ?? []).filter(item => isAssessableItem(set, item));
}

export function assessableItemCount(set) {
  return assessableItems(set).length;
}

export function validateAssessDelivery(set) {
  const count = assessableItemCount(set);
  if (count < 1) {
    const error = new Error('Bài này chưa có câu chấm khách quan an toàn cho Assess.');
    error.code = 'assess_no_gradable_items';
    throw error;
  }
  return count;
}

export function assessPercent(correct, assessableTotal) {
  const total = Number(assessableTotal);
  if (!Number.isFinite(total) || total <= 0) return 0;
  const earned = Math.min(Math.max(Number(correct) || 0, 0), total);
  return Math.round(((earned / total) * 100 + Number.EPSILON) * 100) / 100;
}
