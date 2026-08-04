export function normalizeAnswer(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}
export function evaluateAnswer(input, expected) {
  const normalizedInput = normalizeAnswer(input);
  const normalizedExpected = normalizeAnswer(expected);
  return { correct: normalizedInput === normalizedExpected, normalizedInput, normalizedExpected };
}
