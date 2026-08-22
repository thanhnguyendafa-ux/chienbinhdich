const freeze = value => Object.freeze(value);

const REPLACEMENTS = Object.freeze([
  [/\bexact target\b/gi, 'câu cần sửa'],
  [/\btranscript\b/gi, 'bài'],
  [/\btargets?\b/gi, 'câu'],
  [/\bkeywords?\b/gi, 'từ'],
  [/\bcontexts?\b/gi, 'câu'],
  [/\bevidence\b/gi, 'dữ kiện'],
  [/\breferents?\b/gi, 'từ được nhắc lại'],
  [/\bverdicts?\b/gi, 'kết luận'],
  [/\bmarkers?\b/gi, 'dấu hiệu'],
  [/\bskeletons?\b/gi, 'mẫu câu'],
  [/\bslots?\b/gi, 'chỗ trống'],
  [/\bcategories\b/gi, 'nhóm'],
  [/\bcategory\b/gi, 'nhóm'],
  [/\bspelling\b/gi, 'cách viết'],
  [/\bchunks?\b/gi, 'cụm từ'],
  [/\bspeech function\b/gi, 'cách đáp'],
  [/\bagreement\b/gi, 'số ít/số nhiều']
]);

function clean(text) {
  let value = String(text ?? '');
  for (const [pattern, replacement] of REPLACEMENTS) value = value.replace(pattern, replacement);
  return value.replace(/\s{2,}/g, ' ').trim();
}

function sanitizeChoice(choice) {
  const diagnostic = freeze({
    ...choice.diagnostic,
    error: clean(choice.diagnostic?.error),
    repair: clean(choice.diagnostic?.repair),
    reason: clean(choice.diagnostic?.reason)
  });
  return freeze({
    ...choice,
    text: `Sai: ${diagnostic.error} · Sửa: ${diagnostic.repair} · Vì: ${diagnostic.reason}`,
    diagnostic
  });
}

export function sanitizeG6U2TrapGrade4(content) {
  const items = content.items.map(item => {
    const choices = freeze(item.choices.map(sanitizeChoice));
    const correct = choices.find(choice => choice.id === 'correct');
    const diagnosticSpec = freeze({
      error: correct.diagnostic.error,
      repair: correct.diagnostic.repair,
      reason: correct.diagnostic.reason
    });
    return freeze({
      ...item,
      choices,
      diagnosticSpec,
      teachingFeedback: freeze({
        ...item.teachingFeedback,
        correctLabel: correct.text,
        reason: `Sai: ${diagnosticSpec.error}. Sửa: ${diagnosticSpec.repair}. Vì: ${diagnosticSpec.reason}`,
        theory: clean(item.teachingFeedback?.theory),
        example: clean(item.teachingFeedback?.example)
      })
    });
  });
  return freeze({ ...content, items: freeze(items) });
}
