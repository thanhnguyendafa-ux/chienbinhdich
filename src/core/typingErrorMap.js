import { normalizeAnswer } from './answerEvaluator.js';

const TYPING_SEPARATOR_RE = /^[\s\-‐‑‒–—―−﹣－?？]$/u;
const MISSING_MARKER = '□';

export function typingErrorMapEnabled(item) {
  return (item?.type ?? 'typing') === 'typing' && item?.typingErrorMap === true;
}

export function isTypingSeparator(value) {
  return TYPING_SEPARATOR_RE.test(String(value ?? ''));
}

export function normalizeTypingSeparatorComparable(value) {
  return Array.from(normalizeTypingSurface(value))
    .filter(char => !isTypingSeparator(char))
    .join('');
}

export function buildTypingErrorMap(item, response) {
  const entered = normalizeTypingSurface(response);
  const expectedAnswers = [item?.en, ...(Array.isArray(item?.acceptedAnswers) ? item.acceptedAnswers : [])]
    .filter(value => String(value ?? '').trim().length > 0)
    .map(normalizeTypingSurface)
    .filter((value, index, values) => values.indexOf(value) === index);
  const separatorTolerant = item?.typingSeparatorTolerance === true;
  const candidates = expectedAnswers.map((expected, index) => ({
    ...alignTypingSurface(entered, expected, { separatorTolerant }),
    expected,
    answerIndex: index
  }));
  candidates.sort((left, right) => left.mistakeCount - right.mistakeCount || left.answerIndex - right.answerIndex);
  const best = candidates[0] ?? alignTypingSurface(entered, '', { separatorTolerant });
  return Object.freeze({
    entered,
    expected: best.expected ?? '',
    mistakeCount: best.mistakeCount,
    enteredTokens: Object.freeze(best.enteredTokens),
    expectedTokens: Object.freeze(best.expectedTokens)
  });
}

function normalizeTypingSurface(value) {
  return normalizeAnswer(String(value ?? ''), {
    ignoreCase: false,
    ignorePunctuation: false
  });
}

function alignTypingSurface(entered, expected, { separatorTolerant }) {
  const left = Array.from(entered);
  const right = Array.from(expected);
  const rows = left.length + 1;
  const cols = right.length + 1;
  const cost = Array.from({ length: rows }, () => Array(cols).fill(Number.POSITIVE_INFINITY));
  const trace = Array.from({ length: rows }, () => Array(cols).fill(null));
  cost[0][0] = 0;

  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      if (i === 0 && j === 0) continue;
      const candidates = [];
      if (i > 0 && j > 0) {
        const enteredChar = left[i - 1];
        const expectedChar = right[j - 1];
        const exact = enteredChar === expectedChar;
        const equivalentSeparators = separatorTolerant && isTypingSeparator(enteredChar) && isTypingSeparator(expectedChar);
        candidates.push({
          cost: cost[i - 1][j - 1] + (exact || equivalentSeparators ? 0 : 1),
          priority: exact || equivalentSeparators ? 0 : 3,
          op: exact || equivalentSeparators ? 'match' : 'substitute'
        });
      }
      if (i > 0) {
        const ignored = separatorTolerant && isTypingSeparator(left[i - 1]);
        candidates.push({
          cost: cost[i - 1][j] + (ignored ? 0 : 1),
          priority: ignored ? 1 : 4,
          op: 'delete-entered'
        });
      }
      if (j > 0) {
        const ignored = separatorTolerant && isTypingSeparator(right[j - 1]);
        candidates.push({
          cost: cost[i][j - 1] + (ignored ? 0 : 1),
          priority: ignored ? 1 : 4,
          op: 'insert-expected'
        });
      }
      candidates.sort((a, b) => a.cost - b.cost || a.priority - b.priority);
      cost[i][j] = candidates[0].cost;
      trace[i][j] = candidates[0].op;
    }
  }

  const enteredTokens = [];
  const expectedTokens = [];
  let i = left.length;
  let j = right.length;
  while (i > 0 || j > 0) {
    const op = trace[i][j];
    if (op === 'match') {
      enteredTokens.push(token(left[i - 1], 'correct'));
      expectedTokens.push(token(right[j - 1], 'correct'));
      i -= 1;
      j -= 1;
      continue;
    }
    if (op === 'substitute') {
      enteredTokens.push(token(left[i - 1], 'incorrect'));
      expectedTokens.push(token(right[j - 1], 'incorrect'));
      i -= 1;
      j -= 1;
      continue;
    }
    if (op === 'delete-entered') {
      const enteredChar = left[i - 1];
      const ignored = separatorTolerant && isTypingSeparator(enteredChar);
      enteredTokens.push(token(enteredChar, ignored ? 'correct' : 'incorrect'));
      if (!ignored) expectedTokens.push(token(MISSING_MARKER, 'missing'));
      i -= 1;
      continue;
    }
    if (op === 'insert-expected') {
      const expectedChar = right[j - 1];
      const ignored = separatorTolerant && isTypingSeparator(expectedChar);
      expectedTokens.push(token(expectedChar, ignored ? 'correct' : 'incorrect'));
      if (!ignored) enteredTokens.push(token(MISSING_MARKER, 'missing'));
      j -= 1;
      continue;
    }
    break;
  }

  return {
    mistakeCount: cost[left.length][right.length],
    enteredTokens: enteredTokens.reverse(),
    expectedTokens: expectedTokens.reverse()
  };
}

function token(text, status) {
  return Object.freeze({ text: String(text), status });
}
