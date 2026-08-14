export function normalizeAnswer(value, options = {}) {
  const ignoreCase = options?.ignoreCase === true;
  const ignorePunctuation = options?.ignorePunctuation === true;
  let normalized = String(value ?? '').trim().replace(/[’‘]/g, "'");
  if (ignorePunctuation) normalized = normalized.replace(/[.,?!:;]+/g, ' ');
  if (ignoreCase) normalized = normalized.toLocaleLowerCase('en');
  if (ignorePunctuation) normalized = normalizeYoungLearnerTyping(normalized);
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}

export function evaluateAnswer(input, expected, options = {}) {
  const normalizedInput = normalizeAnswer(input, options);
  const normalizedExpected = normalizeAnswer(expected, options);
  return { correct: normalizedInput === normalizedExpected, normalizedInput, normalizedExpected };
}

function normalizeYoungLearnerTyping(value) {
  let normalized = String(value ?? '').replace(/[‐‑‒–—-]+/g, ' ');
  const replacements = [
    [/\bi'?m\b/gi, 'i am'],
    [/\bhe'?s\b/gi, 'he is'],
    [/\bshe'?s\b/gi, 'she is'],
    [/\bit'?s\b/gi, 'it is'],
    [/\bthey'?re\b/gi, 'they are'],
    [/\bwhat'?s\b/gi, 'what is'],
    [/\bwho'?s\b/gi, 'who is'],
    [/\bwhere'?s\b/gi, 'where is'],
    [/\bthere'?s\b/gi, 'there is'],
    [/\bthat'?s\b/gi, 'that is'],
    [/\bname'?s\b/gi, 'name is'],
    [/\bisn'?t\b/gi, 'is not'],
    [/\baren'?t\b/gi, 'are not'],
    [/\bdon'?t\b/gi, 'do not'],
    [/\bdoesn'?t\b/gi, 'does not'],
    [/\bcan'?t\b/gi, 'cannot'],
    [/\bi'?d\b/gi, 'i would']
  ];
  for (const [pattern, replacement] of replacements) normalized = normalized.replace(pattern, replacement);
  return normalized.replace(/'/g, '').replace(/\s+/g, ' ').trim();
}
