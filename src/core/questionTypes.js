import { evaluateAnswer, normalizeAnswer } from './answerEvaluator.js';

const evaluators = Object.freeze({
  typing: evaluateTyping,
  mcq: evaluateMcq,
  true_false: evaluateTrueFalse,
  sentence_order: evaluateSentenceOrder,
  sequence_number: evaluateSequenceNumber,
  classification: evaluateClassification
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

export function evaluateQuestion(item, response, options = {}) {
  const type = questionTypeForItem(item);
  const evaluator = evaluators[type];
  if (!evaluator) throw new Error(`Unsupported question type: ${type}`);
  return evaluator(item, response, options);
}

export function expectedResponseDisplay(item) {
  const type = questionTypeForItem(item);
  if (type === 'typing') {
    const answers = [item.en, ...(Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers : [])]
      .filter(value => String(value ?? '').trim().length > 0)
      .map(String);
    return [...new Set(answers)].join(' / ');
  }
  if (type === 'mcq') return String(item.choices?.find(choice => choice.id === item.correctChoiceId)?.text ?? '');
  if (type === 'true_false') return item.answer === true ? 'TRUE' : 'FALSE';
  if (type === 'sentence_order') return (item.correctOrder ?? []).join(' ');
  if (type === 'sequence_number') return sequenceNumberResponseDisplay(item, sequenceNumberAnswerMap(item));
  if (type === 'classification') return classificationResponseDisplay(item, classificationAnswerMap(item));
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

export function sequenceNumberAnswerMap(item) {
  const answer = {};
  for (const [index, lineId] of (item?.correctOrder ?? []).entries()) answer[String(lineId)] = index + 1;
  return answer;
}

export function sequenceNumberResponseDisplay(item, response) {
  const normalized = normalizeSequenceNumberResponse(item, response);
  const lineById = new Map((item?.lines ?? []).map(line => [String(line.id), line]));
  return Object.entries(normalized)
    .sort((left, right) => left[1] - right[1])
    .map(([lineId, position]) => `${position}. ${String(lineById.get(lineId)?.text ?? lineId)}`)
    .join(' → ');
}

export function classificationAnswerMap(item) {
  const answer = {};
  for (const token of item?.tokens ?? []) {
    if (!token?.id) continue;
    answer[String(token.id)] = String(token.correctGroupId ?? '');
  }
  return answer;
}

export function classificationResponseDisplay(item, response) {
  const normalized = normalizeClassificationResponse(item, response);
  return (item?.groups ?? []).map(group => {
    const tokenTexts = (item?.tokens ?? [])
      .filter(token => normalized[String(token.id)] === String(group.id))
      .map(token => String(token.text));
    return `${String(group.label ?? group.id)}: ${tokenTexts.join(', ') || '—'}`;
  }).join(' | ');
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
    sentence_order: 'SẮP XẾP CÂU',
    sequence_number: 'SẮP XẾP THỨ TỰ',
    classification: 'PHÂN LOẠI'
  })[type] ?? type.toUpperCase();
}

function evaluateTyping(item, response, options = {}) {
  const tolerant = options?.typingTolerance === true;
  const normalizedOpen = normalizeAnswer(String(response ?? ''), {
    ignoreCase: false,
    ignorePunctuation: false
  });
  if (item?.responseMode === 'open') {
    return {
      correct: normalizedOpen.length > 0,
      normalizedResponse: normalizedOpen,
      displayResponse: normalizedOpen
    };
  }

  const answers = [item.en, ...(Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers : [])]
    .filter(value => String(value ?? '').trim().length > 0);
  let fallback = evaluateAnswer(String(response ?? ''), answers[0] ?? '', {
    ignoreCase: tolerant,
    ignorePunctuation: tolerant
  });

  for (const expected of answers) {
    const result = evaluateAnswer(String(response ?? ''), expected, {
      ignoreCase: tolerant,
      ignorePunctuation: tolerant
    });
    if (result.correct) {
      return {
        correct: true,
        normalizedResponse: result.normalizedInput,
        displayResponse: result.normalizedInput
      };
    }
    fallback = fallback ?? result;
  }

  return {
    correct: false,
    normalizedResponse: fallback.normalizedInput,
    displayResponse: fallback.normalizedInput
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

function evaluateSequenceNumber(item, response) {
  const normalized = normalizeSequenceNumberResponse(item, response);
  const expected = sequenceNumberAnswerMap(item);
  const lineIds = (item?.lines ?? []).map(line => String(line.id));
  const values = Object.values(normalized);
  const correct = Object.keys(normalized).length === lineIds.length
    && new Set(values).size === lineIds.length
    && lineIds.every(lineId => normalized[lineId] === expected[lineId]);
  return {
    correct,
    normalizedResponse: normalized,
    displayResponse: sequenceNumberResponseDisplay(item, normalized)
  };
}

function evaluateClassification(item, response) {
  const normalized = normalizeClassificationResponse(item, response);
  const expected = classificationAnswerMap(item);
  const tokenIds = (item?.tokens ?? []).map(token => String(token.id));
  const correct = Object.keys(normalized).length === tokenIds.length
    && tokenIds.every(tokenId => normalized[tokenId] === expected[tokenId]);
  return {
    correct,
    normalizedResponse: normalized,
    displayResponse: classificationResponseDisplay(item, normalized)
  };
}

function normalizeOrder(value) {
  return Array.isArray(value) ? value.map(token => String(token)) : [];
}

function normalizeSequenceNumberResponse(item, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const lineIds = new Set((item?.lines ?? []).map(line => String(line.id)));
  const max = lineIds.size;
  const normalized = {};
  for (const [lineId, rawPosition] of Object.entries(value)) {
    const key = String(lineId);
    const position = Number(rawPosition);
    if (!lineIds.has(key) || !Number.isInteger(position) || position < 1 || position > max) continue;
    normalized[key] = position;
  }
  return normalized;
}

function normalizeClassificationResponse(item, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const tokenIds = new Set((item?.tokens ?? []).map(token => String(token.id)));
  const normalized = {};
  for (const [tokenId, groupId] of Object.entries(value)) {
    const key = String(tokenId);
    if (!tokenIds.has(key)) continue;
    normalized[key] = String(groupId);
  }
  return normalized;
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
