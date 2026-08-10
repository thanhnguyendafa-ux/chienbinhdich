export function normalizeAnswer(value, options = {}) {
  const ignoreCase = options?.ignoreCase === true;
  const ignorePunctuation = options?.ignorePunctuation === true;
  let normalized = String(value ?? '').trim();
  if (ignorePunctuation) normalized = normalized.replace(/[.,?!:;]+/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  if (ignoreCase) normalized = normalized.toLocaleLowerCase('en');
  return normalized;
}

export function evaluateAnswer(input, expected, options = {}) {
  const normalizedInput = normalizeAnswer(input, options);
  const normalizedExpected = normalizeAnswer(expected, options);
  return { correct: normalizedInput === normalizedExpected, normalizedInput, normalizedExpected };
}
