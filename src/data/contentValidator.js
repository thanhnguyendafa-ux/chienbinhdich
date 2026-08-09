import { SUPPORTED_QUESTION_TYPES, questionTypeForItem } from '../core/questionTypes.js';
import { validatePassThreshold } from '../core/masteryPolicy.js';

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
  validatePrintGroups(set, errors);

  for (const item of set.items) {
    const type = questionTypeForItem(item);
    if (!item?.id || !SUPPORTED_QUESTION_TYPES.includes(type)) {
      errors.push(`Item không hợp lệ: ${item?.id ?? '(không id)'}`);
      continue;
    }
    if (ids.has(item.id)) errors.push(`ID trùng: ${item.id}`);
    ids.add(item.id);

    validateItemByType(item, type, errors);
    validateStimulus(item, type, errors);
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

  if (set.passThreshold !== undefined) {
    errors.push(...validatePassThreshold(set.passThreshold, `Set ${set.id} passThreshold`));
  }
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
    validateSentenceOrder(item, errors);
    return;
  }

  if (type === 'classification') validateClassification(item, errors);
}

function validateClassification(item, errors) {
  if (!nonEmpty(item.prompt) || !Array.isArray(item.groups) || item.groups.length < 2 || !Array.isArray(item.tokens) || item.tokens.length < 2) {
    errors.push(`Classification không hợp lệ: ${item.id}`);
    return;
  }

  const groupIds = new Set();
  for (const group of item.groups) {
    if (!nonEmpty(group?.id) || !nonEmpty(group?.label) || groupIds.has(group.id)) {
      errors.push(`Classification ${item.id} có group không hợp lệ`);
      continue;
    }
    groupIds.add(group.id);
    if (group.helper !== undefined && !nonEmpty(group.helper)) errors.push(`Classification ${item.id} có helper group rỗng: ${group.id}`);
  }

  const tokenIds = new Set();
  const tokenCountByGroup = new Map([...groupIds].map(groupId => [groupId, 0]));
  for (const token of item.tokens) {
    if (!nonEmpty(token?.id) || !nonEmpty(token?.text) || tokenIds.has(token.id)) {
      errors.push(`Classification ${item.id} có token không hợp lệ`);
      continue;
    }
    tokenIds.add(token.id);
    if (!groupIds.has(token.correctGroupId)) {
      errors.push(`Classification ${item.id}/${token.id} trỏ group không tồn tại: ${token.correctGroupId ?? '(trống)'}`);
      continue;
    }
    tokenCountByGroup.set(token.correctGroupId, (tokenCountByGroup.get(token.correctGroupId) ?? 0) + 1);
  }

  for (const groupId of groupIds) {
    if ((tokenCountByGroup.get(groupId) ?? 0) === 0) errors.push(`Classification ${item.id} có group không có token: ${groupId}`);
  }

  if (item.classificationKind !== undefined && !['stress', 'vocabulary', 'generic'].includes(item.classificationKind)) {
    errors.push(`Classification ${item.id} có classificationKind không hợp lệ`);
  }
  if (item.classificationHint !== undefined && !nonEmpty(item.classificationHint)) {
    errors.push(`Classification ${item.id} có classificationHint rỗng`);
  }
}

function validateSentenceOrder(item, errors) {
  const tokens = item.tokens ?? item.correctOrder;
  if (!nonEmpty(item.prompt) || !Array.isArray(tokens) || !Array.isArray(item.correctOrder) || item.correctOrder.length < 2) {
    errors.push(`Sentence Order không hợp lệ: ${item.id}`);
    return;
  }

  const accepted = item.acceptedOrders === undefined ? [item.correctOrder] : item.acceptedOrders;
  if (!Array.isArray(accepted) || accepted.length === 0) {
    errors.push(`Sentence Order ${item.id} phải có ít nhất một acceptedOrder`);
    return;
  }

  const acceptedKeys = new Set();
  let canonicalFound = false;
  for (const order of accepted) {
    if (!Array.isArray(order) || order.length < 2 || order.some(token => !nonEmpty(String(token)))) {
      errors.push(`Sentence Order ${item.id} có acceptedOrder không hợp lệ`);
      continue;
    }
    if (!isSubMultiset(order, tokens)) {
      errors.push(`Sentence Order ${item.id} có acceptedOrder dùng token ngoài token pool`);
    }
    const key = sequenceKey(order);
    if (acceptedKeys.has(key)) errors.push(`Sentence Order ${item.id} có acceptedOrder bị trùng`);
    acceptedKeys.add(key);
    if (sameSequence(order, item.correctOrder)) canonicalFound = true;
  }

  if (!canonicalFound) errors.push(`Sentence Order ${item.id} phải chứa correctOrder trong acceptedOrders`);
  if (!isSubMultiset(item.correctOrder, tokens)) errors.push(`Sentence Order ${item.id} có correctOrder dùng token ngoài token pool`);
  if (item.displayOrder && !sameMultiset(item.displayOrder, tokens)) {
    errors.push(`Sentence Order ${item.id} có displayOrder không khớp token pool`);
  }

  validateOrderDiagnostics(item, tokens, accepted, errors);
}

function validateOrderDiagnostics(item, tokens, accepted, errors) {
  if (item.orderDiagnostics === undefined) return;
  const diagnostics = item.orderDiagnostics;
  if (!diagnostics || typeof diagnostics !== 'object' || Array.isArray(diagnostics)) {
    errors.push(`Sentence Order diagnostics không hợp lệ tại ${item.id}`);
    return;
  }

  const distractors = diagnostics.distractors ?? [];
  if (!Array.isArray(distractors)) {
    errors.push(`Sentence Order ${item.id} distractors phải là mảng`);
  } else {
    const seenTokens = new Set();
    for (const distractor of distractors) {
      if (!nonEmpty(distractor?.token) || !nonEmpty(distractor?.code) || !nonEmpty(distractor?.hint)) {
        errors.push(`Sentence Order ${item.id} có distractor diagnostic không hợp lệ`);
        continue;
      }
      if (seenTokens.has(distractor.token)) errors.push(`Sentence Order ${item.id} có distractor trùng: ${distractor.token}`);
      seenTokens.add(distractor.token);
      if (!tokens.map(String).includes(String(distractor.token))) {
        errors.push(`Sentence Order ${item.id} có distractor không nằm trong token pool: ${distractor.token}`);
      }
      if (accepted.some(order => order.map(String).includes(String(distractor.token)))) {
        errors.push(`Sentence Order ${item.id} gắn distractor cho token thuộc acceptedOrder: ${distractor.token}`);
      }
    }
  }

  const rules = diagnostics.rules ?? [];
  if (!Array.isArray(rules)) {
    errors.push(`Sentence Order ${item.id} diagnostic rules phải là mảng`);
    return;
  }
  for (const rule of rules) {
    if (!nonEmpty(rule?.code) || !nonEmpty(rule?.hint) || !Array.isArray(rule?.all) || rule.all.length === 0) {
      errors.push(`Sentence Order ${item.id} có diagnostic rule không hợp lệ`);
      continue;
    }
    for (const token of [...rule.all, ...(rule.none ?? [])]) {
      if (!tokens.map(String).includes(String(token))) {
        errors.push(`Sentence Order ${item.id} diagnostic rule dùng token ngoài pool: ${token}`);
      }
    }
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

function validateStimulus(item, type, errors) {
  if (item.stimulus === undefined) return;
  if (type !== 'mcq') {
    errors.push(`Stimulus chỉ hỗ trợ MCQ tại ${item.id}`);
    return;
  }
  const stimulus = item.stimulus;
  if (!stimulus || typeof stimulus !== 'object' || Array.isArray(stimulus)) {
    errors.push(`Stimulus không hợp lệ tại ${item.id}`);
    return;
  }
  if (!nonEmpty(stimulus.title)) errors.push(`Stimulus ${item.id} thiếu title`);
  if (!nonEmpty(stimulus.text)) errors.push(`Stimulus ${item.id} thiếu text`);
  if (item.passageId !== undefined) errors.push(`MCQ ${item.id} không được dùng đồng thời stimulus và passageId`);
}

function validatePrintGroups(set, errors) {
  if (set.printGroups === undefined) return;
  if (!Array.isArray(set.printGroups) || set.printGroups.length === 0) {
    errors.push(`Set ${set.id} printGroups phải là mảng không rỗng.`);
    return;
  }
  if (Array.isArray(set.passages) && set.passages.length > 0) {
    errors.push(`Set ${set.id} không được dùng printGroups cùng passages; Reading tự group theo passage.`);
    return;
  }

  const sourceItemIds = set.items
    .filter(item => item?.id !== undefined && item?.id !== null)
    .map(item => String(item.id));
  const validItemIds = new Set(sourceItemIds);
  const seenItemIds = new Set();
  const seenGroupIds = new Set();
  const groupedItemIds = [];

  for (const [index, group] of set.printGroups.entries()) {
    validatePrintGroup({ group, index, validItemIds, seenItemIds, seenGroupIds, groupedItemIds, errors });
  }

  validatePrintGroupCoverage(validItemIds, seenItemIds, errors);
  validatePrintGroupOrder(sourceItemIds, groupedItemIds, validItemIds, seenItemIds, errors, set.id);
}

function validatePrintGroup({ group, index, validItemIds, seenItemIds, seenGroupIds, groupedItemIds, errors }) {
  const groupId = String(group?.id ?? `group-${index + 1}`);
  if (!nonEmpty(group?.title) || !Array.isArray(group?.itemIds) || group.itemIds.length === 0) {
    errors.push(`Print group ${groupId} không hợp lệ.`);
    return;
  }
  if (seenGroupIds.has(groupId)) errors.push(`Print group id bị trùng: ${groupId}`);
  seenGroupIds.add(groupId);
  validatePrintGroupItems(groupId, group.itemIds, validItemIds, seenItemIds, groupedItemIds, errors);
}

function validatePrintGroupItems(groupId, itemIds, validItemIds, seenItemIds, groupedItemIds, errors) {
  for (const itemIdValue of itemIds) {
    const itemId = String(itemIdValue);
    if (!validItemIds.has(itemId)) {
      errors.push(`Print group ${groupId} trỏ item không tồn tại: ${itemId}`);
      continue;
    }
    if (seenItemIds.has(itemId)) {
      errors.push(`Print group dùng trùng item: ${itemId}`);
      continue;
    }
    seenItemIds.add(itemId);
    groupedItemIds.push(itemId);
  }
}

function validatePrintGroupCoverage(validItemIds, seenItemIds, errors) {
  for (const itemId of validItemIds) {
    if (!seenItemIds.has(itemId)) errors.push(`Print groups thiếu item: ${itemId}`);
  }
}

function validatePrintGroupOrder(sourceItemIds, groupedItemIds, validItemIds, seenItemIds, errors, setId) {
  if (seenItemIds.size !== validItemIds.size || groupedItemIds.length !== sourceItemIds.length) return;
  if (!sourceItemIds.every((itemId, index) => groupedItemIds[index] === itemId)) {
    errors.push(`Print groups phải giữ nguyên thứ tự item của Set ${setId}.`);
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

function isSubMultiset(subset = [], superset = []) {
  const counts = multisetCounts(superset);
  for (const value of subset.map(String)) {
    const available = counts.get(value) ?? 0;
    if (available <= 0) return false;
    counts.set(value, available - 1);
  }
  return true;
}

function sameMultiset(left = [], right = []) {
  return left.length === right.length && isSubMultiset(left, right);
}

function sameSequence(left = [], right = []) {
  return left.length === right.length && left.every((value, index) => String(value) === String(right[index]));
}

function multisetCounts(values = []) {
  const counts = new Map();
  for (const value of values.map(String)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function sequenceKey(order) {
  return JSON.stringify(order.map(String));
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
