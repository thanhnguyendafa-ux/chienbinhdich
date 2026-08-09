import { acceptedSentenceOrders, questionTypeForItem, sentenceOrderHasUnusedTokens } from './questionTypes.js';

const DEFAULT_HINTS = Object.freeze({
  right_tokens_wrong_order: 'Các khối con chọn phù hợp, nhưng thứ tự chưa đúng. Hãy xem lại vị trí của từng thành phần trong câu.',
  missing_token: 'Câu của con đang thiếu một thành phần cần thiết. Hãy xem lại các khối còn lại trong kho.',
  extra_token: 'Câu của con đang có một khối thừa. Không nhất thiết phải dùng hết các khối.',
  selection_or_order: 'Hãy kiểm tra lại cả các khối đã chọn và thứ tự của chúng.'
});

const LABELS = Object.freeze({
  correct: 'Đúng',
  right_tokens_wrong_order: 'Đúng khối · sai thứ tự',
  missing_token: 'Thiếu thành phần',
  extra_token: 'Thừa thành phần',
  selection_or_order: 'Sai chọn khối / thứ tự',
  double_auxiliary: 'Lặp trợ động từ / to be',
  missing_auxiliary: 'Thiếu trợ động từ / to be',
  wrong_preposition: 'Sai giới từ',
  wrong_verb_form: 'Sai dạng động từ',
  subject_verb_agreement: 'Sai hòa hợp chủ ngữ – động từ',
  wrong_auxiliary: 'Sai trợ động từ / to be',
  wrong_possessive: 'Sai tính từ sở hữu',
  wrong_subject: 'Sai chủ thể',
  wrong_word_choice: 'Chọn sai từ'
});

export function diagnoseSentenceOrder(item, response) {
  if (questionTypeForItem(item) !== 'sentence_order') return null;
  const selected = normalize(response, item);
  const accepted = acceptedSentenceOrders(item);

  if (accepted.some(order => sameSequence(selected, order))) {
    return Object.freeze({ code: 'correct', label: LABELS.correct, hint: '' });
  }

  for (const rule of item?.orderDiagnostics?.rules ?? []) {
    if (ruleMatches(rule, selected)) {
      return diagnostic(rule.code, rule.hint);
    }
  }

  for (const distractor of item?.orderDiagnostics?.distractors ?? []) {
    if (selected.includes(String(distractor.token))) {
      return diagnostic(distractor.code, distractor.hint);
    }
  }

  if (accepted.some(order => sameMultiset(selected, order))) {
    return diagnostic('right_tokens_wrong_order', DEFAULT_HINTS.right_tokens_wrong_order);
  }
  if (accepted.some(order => isSubMultiset(selected, order))) {
    return diagnostic('missing_token', DEFAULT_HINTS.missing_token);
  }
  if (accepted.some(order => isSubMultiset(order, selected))) {
    return diagnostic('extra_token', DEFAULT_HINTS.extra_token);
  }
  return diagnostic('selection_or_order', DEFAULT_HINTS.selection_or_order);
}

export function sentenceOrderFeedbackHint(item, response) {
  const result = diagnoseSentenceOrder(item, response);
  return result && result.code !== 'correct' ? result.hint : '';
}

export function sentenceOrderDiagnosticLabel(code) {
  return LABELS[code] ?? String(code ?? '');
}

export function deriveSentenceOrderDiagnostics(session, set) {
  const itemById = new Map((set?.items ?? []).map(item => [item.id, item]));
  const firstMainAttempts = (session?.attempts ?? []).filter(attempt => {
    if (attempt.promptKind !== 'main' || attempt.attemptNumber !== 1) return false;
    const item = itemById.get(attempt.itemId);
    return isSelectOrderItem(item);
  });

  const byCode = {};
  let correct = 0;
  for (const attempt of firstMainAttempts) {
    const item = itemById.get(attempt.itemId);
    const result = diagnoseSentenceOrder(item, attempt.submittedResponse);
    const code = result?.code ?? 'selection_or_order';
    if (code === 'correct') correct += 1;
    else byCode[code] = (byCode[code] ?? 0) + 1;
  }

  const errors = Object.entries(byCode)
    .map(([code, count]) => Object.freeze({ code, count, label: sentenceOrderDiagnosticLabel(code) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'vi'));

  return Object.freeze({
    total: firstMainAttempts.length,
    correct,
    wrong: firstMainAttempts.length - correct,
    byCode: Object.freeze({ ...byCode }),
    errors: Object.freeze(errors)
  });
}

export function isSelectOrderItem(item) {
  return questionTypeForItem(item) === 'sentence_order'
    && (sentenceOrderHasUnusedTokens(item) || Array.isArray(item?.acceptedOrders) || item?.orderDiagnostics !== undefined);
}

function diagnostic(code, hint) {
  return Object.freeze({
    code: String(code),
    label: sentenceOrderDiagnosticLabel(code),
    hint: String(hint ?? DEFAULT_HINTS.selection_or_order)
  });
}

function ruleMatches(rule, selected) {
  const all = (rule?.all ?? []).map(String);
  const none = (rule?.none ?? []).map(String);
  return all.length > 0
    && all.every(token => selected.includes(token))
    && none.every(token => !selected.includes(token));
}

function normalize(value, item) {
  if (Array.isArray(value)) return value.map(String);
  const display = String(value ?? '').trim();
  if (!display) return [];
  return parseDisplayResponse(display, item?.tokens ?? item?.correctOrder ?? []) ?? [display];
}

function parseDisplayResponse(display, tokens) {
  const pool = tokens.map((token, index) => ({ token: String(token), index }))
    .sort((a, b) => b.token.length - a.token.length);
  const visit = (remaining, available, selected) => {
    if (!remaining) return selected;
    for (const candidate of available) {
      if (remaining !== candidate.token && !remaining.startsWith(`${candidate.token} `)) continue;
      const nextRemaining = remaining === candidate.token ? '' : remaining.slice(candidate.token.length + 1);
      const nextAvailable = available.filter(entry => entry.index !== candidate.index);
      const result = visit(nextRemaining, nextAvailable, [...selected, candidate.token]);
      if (result) return result;
    }
    return null;
  };
  return visit(display, pool, []);
}

function sameSequence(left = [], right = []) {
  return left.length === right.length && left.every((value, index) => value === String(right[index]));
}

function isSubMultiset(subset = [], superset = []) {
  const counts = new Map();
  for (const value of superset.map(String)) counts.set(value, (counts.get(value) ?? 0) + 1);
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
