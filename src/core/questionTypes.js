import { evaluateAnswer } from './answerEvaluator.js';

const evaluators = Object.freeze({
  typing: evaluateTyping,
  mcq: evaluateMcq,
  true_false: evaluateTrueFalse,
  sentence_order: evaluateSentenceOrder
});

const DEFAULT_TYPING_UI = Object.freeze({
  promptLabel: 'Gõ tiếng Anh',
  contextLabel: 'Tiếng Việt',
  instruction: 'Dịch sang tiếng Anh.',
  inputLabel: 'Câu trả lời tiếng Anh',
  placeholder: 'Type English here...'
});

export const SUPPORTED_QUESTION_TYPES = Object.freeze(Object.keys(evaluators));

export function questionTypeForItem(item) {
  return item?.type ?? 'typing';
}

export function evaluateQuestion(item, response) {
  const type = questionTypeForItem(item);
  const evaluator = evaluators[type];
  if (!evaluator) throw new Error(`Unsupported question type: ${type}`);
  return evaluator(item, response);
}

export function expectedResponseDisplay(item) {
  const type = questionTypeForItem(item);
  if (type === 'typing') return String(item.en ?? '');
  if (type === 'mcq') return String(item.choices?.find(choice => choice.id === item.correctChoiceId)?.text ?? '');
  if (type === 'true_false') return item.answer === true ? 'TRUE' : 'FALSE';
  if (type === 'sentence_order') return (item.correctOrder ?? []).join(' ');
  return '';
}

export function acceptedSentenceOrders(item) {
  const canonical = normalizeOrder(item?.correctOrder);
  const raw = Array.isArray(item?.acceptedOrders) && item.acceptedOrders.length
    ? item.acceptedOrders
    : [canonical];
  const output = [];
  const seen = new Set();

  for (const candidate of raw) {
    const normalized = normalizeOrder(candidate);
    if (!normalized.length) continue;
    const key = sequenceKey(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }

  if (canonical.length) {
    const canonicalKey = sequenceKey(canonical);
    if (!seen.has(canonicalKey)) output.unshift(canonical);
  }
  return output;
}

export function acceptedSentenceOrderDisplays(item) {
  return acceptedSentenceOrders(item).map(order => order.join(' '));
}

export function sentenceOrderMinimumLength(item) {
  const lengths = acceptedSentenceOrders(item).map(order => order.length).filter(length => length > 0);
  return lengths.length ? Math.min(...lengths) : 1;
}

export function sentenceOrderHasUnusedTokens(item) {
  const tokens = normalizeOrder(item?.tokens ?? item?.correctOrder);
  if (!tokens.length) return false;
  return acceptedSentenceOrders(item).every(order => !sameMultiset(tokens, order));
}

export function questionPromptDisplay(item) {
  const type = questionTypeForItem(item);
  if (type === 'typing') return String(item.vi ?? '');
  if (type === 'true_false') return String(item.statement ?? '');
  return String(item.prompt ?? '');
}

export function typingUiForItem(item) {
  const custom = item?.typingUi ?? {};
  return Object.freeze({
    promptLabel: String(custom.promptLabel ?? DEFAULT_TYPING_UI.promptLabel),
    contextLabel: String(custom.contextLabel ?? DEFAULT_TYPING_UI.contextLabel),
    instruction: String(custom.instruction ?? DEFAULT_TYPING_UI.instruction),
    inputLabel: String(custom.inputLabel ?? DEFAULT_TYPING_UI.inputLabel),
    placeholder: String(custom.placeholder ?? DEFAULT_TYPING_UI.placeholder)
  });
}

export function questionTypeLabel(itemOrType) {
  const type = typeof itemOrType === 'string' ? itemOrType : questionTypeForItem(itemOrType);
  return ({
    typing: 'TYPING',
    mcq: 'MCQ',
    true_false: 'TRUE / FALSE',
    sentence_order: 'SẮP XẾP CÂU'
  })[type] ?? type.toUpperCase();
}

function evaluateTyping(item, response) {
  const result = evaluateAnswer(String(response ?? ''), item.en);
  return {
    correct: result.correct,
    normalizedResponse: result.normalizedInput,
    displayResponse: result.normalizedInput
  };
}

function evaluateMcq(item, response) {
  const normalized = String(response ?? '');
  const choice = item.choices?.find(candidate => candidate.id === normalized);
  return {
    correct: normalized === String(item.correctChoiceId),
    normalizedResponse: normalized,
    displayResponse: choice?.text ?? normalized
  };
}

function evaluateTrueFalse(item, response) {
  const normalized = response === true || response === 'true'
    ? true
    : response === false || response === 'false'
      ? false
      : null;
  return {
    correct: normalized !== null && normalized === item.answer,
    normalizedResponse: normalized,
    displayResponse: normalized === null ? '' : (normalized ? 'TRUE' : 'FALSE')
  };
}

function evaluateSentenceOrder(item, response) {
  const normalized = normalizeOrder(response);
  const accepted = acceptedSentenceOrders(item);
  const correct = accepted.some(expected => sameSequence(normalized, expected));
  return {
    correct,
    normalizedResponse: normalized,
    displayResponse: normalized.join(' ')
  };
}

function normalizeOrder(value) {
  return Array.isArray(value) ? value.map(token => String(token)) : [];
}

function sameSequence(left, right) {
  return left.length === right.length && left.every((token, index) => token === right[index]);
}

function sameMultiset(left = [], right = []) {
  if (left.length !== right.length) return false;
  const sortedLeft = left.map(String).sort();
  const sortedRight = right.map(String).sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function sequenceKey(order) {
  return JSON.stringify(order);
}
