import { evaluateAnswer } from './answerEvaluator.js';

const evaluators = Object.freeze({
  typing: evaluateTyping,
  mcq: evaluateMcq,
  true_false: evaluateTrueFalse,
  sentence_order: evaluateSentenceOrder
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

export function questionPromptDisplay(item) {
  const type = questionTypeForItem(item);
  if (type === 'typing') return String(item.vi ?? '');
  if (type === 'true_false') return String(item.statement ?? '');
  return String(item.prompt ?? '');
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
  const normalized = Array.isArray(response) ? response.map(token => String(token)) : [];
  const expected = (item.correctOrder ?? []).map(token => String(token));
  const correct = normalized.length === expected.length && normalized.every((token, index) => token === expected[index]);
  return {
    correct,
    normalizedResponse: normalized,
    displayResponse: normalized.join(' ')
  };
}
