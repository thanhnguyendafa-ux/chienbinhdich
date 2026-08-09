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

  validatePassages(set, errors);

  for (const item of set.items) {
    const type = questionTypeForItem(item);
    if (!item?.id || !SUPPORTED_QUESTION_TYPES.includes(type)) {
      errors.push(`Item không hợp lệ: ${item?.id ?? '(không id)'}`);
      continue;
    }
    if (ids.has(item.id)) errors.push(`ID trùng: ${item.id}`);
    ids.add(item.id);

    validateItemByType(item, type, errors);
    validateReadingItem(item, set, errors);
    validateTeachingFeedback(item, errors);

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
    if (!nonEmpty(item.vi) || !nonEmpty(item.en)) errors.push(`Typing item không hợp lệ: ${item.id}`);
    validateTypingUi(item, errors);
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

function validatePassages(set, errors) {
  if (set.passages === undefined) return;
  if (!Array.isArray(set.passages) || set.passages.length === 0) {
    errors.push('Reading set phải có ít nhất một passage.');
    return;
  }
  const ids = new Set();
  for (const passage of set.passages) {
    if (!nonEmpty(passage?.id) || !nonEmpty(passage?.title) || !nonEmpty(passage?.text)) {
      errors.push(`Passage không hợp lệ: ${passage?.id ?? '(không id)'}`);
      continue;
    }
    if (ids.has(passage.id)) errors.push(`Passage id bị trùng: ${passage.id}`);
    ids.add(passage.id);
  }
}

function validateReadingItem(item, set, errors) {
  if (item.passageId === undefined) return;
  if (questionTypeForItem(item) !== 'mcq') {
    errors.push(`Reading item ${item.id} phải dùng type mcq`);
    return;
  }
  const passageIds = new Set((set.passages ?? []).map(passage => passage.id));
  if (!passageIds.has(item.passageId)) errors.push(`Reading item ${item.id} trỏ passage không tồn tại: ${item.passageId}`);
  if (!Array.isArray(item.choices) || item.choices.length !== 4) {
    errors.push(`Reading item ${item.id} phải có đúng 4 choices diagnostic`);
    return;
  }

  const quadrants = new Set();
  for (const choice of item.choices) {
    const diagnostic = choice?.diagnostic;
    if (!diagnostic || typeof diagnostic.verdictCorrect !== 'boolean' || typeof diagnostic.reasonCorrect !== 'boolean') {
      errors.push(`Reading choice ${item.id}/${choice?.id ?? '?'} thiếu diagnostic hợp lệ`);
      continue;
    }
    quadrants.add(`${diagnostic.verdictCorrect}:${diagnostic.reasonCorrect}`);
    const isFullyCorrect = diagnostic.verdictCorrect && diagnostic.reasonCorrect;
    if (isFullyCorrect && choice.id !== item.correctChoiceId) {
      errors.push(`Reading item ${item.id} có choice đúng cả verdict/reason nhưng không phải correctChoiceId`);
    }
    if (!isFullyCorrect && !nonEmpty(diagnostic.errorCode)) {
      errors.push(`Reading choice ${item.id}/${choice.id} thiếu errorCode`);
    }
  }
  if (quadrants.size !== 4) errors.push(`Reading item ${item.id} phải đủ 4 quadrant verdict × reason`);
  const correct = item.choices.find(choice => choice.id === item.correctChoiceId);
  if (!(correct?.diagnostic?.verdictCorrect && correct?.diagnostic?.reasonCorrect)) {
    errors.push(`Reading item ${item.id} correctChoiceId phải đúng cả verdict và reason`);
  }
}

function validateTypingUi(item, errors) {
  if (item.typingUi === undefined) return;
  if (!item.typingUi || typeof item.typingUi !== 'object' || Array.isArray(item.typingUi)) {
    errors.push(`Typing UI không hợp lệ tại ${item.id}`);
    return;
  }
  for (const field of ['promptLabel', 'contextLabel', 'instruction', 'inputLabel', 'placeholder']) {
    if (!nonEmpty(item.typingUi[field])) errors.push(`Typing UI ${item.id} thiếu ${field}`);
  }
}

function validateTeachingFeedback(item, errors) {
  if (item.teachingFeedback === undefined) return;
  const value = item.teachingFeedback;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`Teaching feedback không hợp lệ tại ${item.id}`);
    return;
  }
  for (const field of ['correctLabel', 'reason', 'theory', 'example']) {
    if (!nonEmpty(value[field])) errors.push(`Teaching feedback ${item.id} thiếu ${field}`);
  }
  validateWorkedExample(item.id, value.workedExample, errors);
}

function validateWorkedExample(itemId, workedExample, errors) {
  if (workedExample === undefined) return;
  if (!workedExample || typeof workedExample !== 'object' || Array.isArray(workedExample)) {
    errors.push(`Worked example không hợp lệ tại ${itemId}`);
    return;
  }
  if (!nonEmpty(workedExample.label)) errors.push(`Worked example ${itemId} thiếu label`);
  if (!nonEmpty(workedExample.text)) errors.push(`Worked example ${itemId} thiếu text`);
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
