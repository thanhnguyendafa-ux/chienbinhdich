import { SUPPORTED_QUESTION_TYPES, questionTypeForItem } from '../core/questionTypes.js';

const stageRank = Object.freeze({ word: 0, phrase: 1, sentence: 2 });

export function validateSet(set) {
  const errors = [];
  const ids = new Set();
  const seen = new Set();
  let previousRank = -1;

  if (!set?.id || !Array.isArray(set.items) || set.items.length === 0) {
    return ['Set phải có id và ít nhất một item.'];
  }

  for (const item of set.items) {
    const type = questionTypeForItem(item);
    if (!item?.id || !SUPPORTED_QUESTION_TYPES.includes(type)) {
      errors.push(`Item không hợp lệ: ${item?.id ?? '(không id)'}`);
      continue;
    }
    if (ids.has(item.id)) errors.push(`ID trùng: ${item.id}`);
    ids.add(item.id);

    validateItemByType(item, type, errors);

    if (item.stage !== undefined) {
      if (!(item.stage in stageRank)) errors.push(`Stage không hợp lệ tại ${item.id}`);
      else {
        const rank = stageRank[item.stage];
        if (rank < previousRank) errors.push(`Sai thứ tự stage tại ${item.id}`);
        previousRank = Math.max(previousRank, rank);
      }
    }

    for (const dependency of item.buildsFrom ?? []) {
      if (!seen.has(dependency)) errors.push(`${item.id} dùng prerequisite chưa xuất hiện: ${dependency}`);
    }
    seen.add(item.id);
  }

  if (set.passThreshold !== 80) errors.push('V1 yêu cầu passThreshold = 80.');
  return errors;
}

function validateItemByType(item, type, errors) {
  if (type === 'typing') {
    if (!nonEmpty(item.vi) || !nonEmpty(item.en) || !(item.stage in stageRank)) errors.push(`Typing item không hợp lệ: ${item.id}`);
    return;
  }

  if (type === 'mcq') {
    if (!nonEmpty(item.prompt) || !Array.isArray(item.choices) || item.choices.length < 2) {
      errors.push(`MCQ không hợp lệ: ${item.id}`);
      return;
    }
    const choiceIds = new Set();
    for (const choice of item.choices) {
      if (!nonEmpty(choice?.id) || !nonEmpty(choice?.text) || choiceIds.has(choice.id)) errors.push(`Choice không hợp lệ tại ${item.id}`);
      choiceIds.add(choice?.id);
    }
    if (!choiceIds.has(item.correctChoiceId)) errors.push(`MCQ ${item.id} thiếu correctChoiceId hợp lệ`);
    return;
  }

  if (type === 'true_false') {
    if (!nonEmpty(item.statement) || typeof item.answer !== 'boolean') errors.push(`True/False không hợp lệ: ${item.id}`);
    return;
  }

  if (type === 'sentence_order') {
    const tokens = item.tokens ?? item.correctOrder;
    if (!nonEmpty(item.prompt) || !Array.isArray(tokens) || !Array.isArray(item.correctOrder) || item.correctOrder.length < 2) {
      errors.push(`Sentence Order không hợp lệ: ${item.id}`);
      return;
    }
    if (!sameMultiset(tokens, item.correctOrder)) errors.push(`Sentence Order ${item.id} có token không khớp đáp án`);
    if (item.displayOrder && !sameMultiset(item.displayOrder, item.correctOrder)) errors.push(`Sentence Order ${item.id} có displayOrder không khớp đáp án`);
  }
}

function sameMultiset(left = [], right = []) {
  if (left.length !== right.length) return false;
  const sortedLeft = left.map(String).sort();
  const sortedRight = right.map(String).sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
