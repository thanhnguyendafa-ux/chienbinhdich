function youngLearnerDiagnosisText(value) {
  return String(value ?? '')
    .replace(/\bexact target\b/gi, 'câu đích')
    .replace(/\btranscript\b/gi, 'bài')
    .replace(/\bcategory\b/gi, 'nhóm')
    .replace(/\bcontext\b/gi, 'câu')
    .replace(/\breferent\b/gi, 'từ được nhắc lại')
    .replace(/\bverdict\b/gi, 'đáp án')
    .replace(/\bmarker\b/gi, 'dấu hiệu')
    .replace(/\bskeleton\b/gi, 'mẫu câu')
    .replace(/\bevidence\b/gi, 'dữ kiện')
    .replace(/\bkeywords?\b/gi, 'từ')
    .replace(/\bslot\b/gi, 'chỗ')
    .replace(/\bspelling\b/gi, 'cách viết')
    .replace(/\bspeech function\b/gi, 'cách đáp')
    .replace(/\bchunk order\b/gi, 'thứ tự cụm từ')
    .replace(/\bchunks?\b/gi, 'cụm từ')
    .replace(/\s+trong câu đích\b/gi, '')
    .replace(/\s+để khớp bài\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function defineTrapLesson(raw) {
  const items = raw.items.map((row, index) => Object.freeze({
    id: row[0],
    itemOrder: index + 1,
    trapCode: raw.trapCode,
    examType: raw.examType,
    sourceScope: raw.sourceScope,
    sourceEvidence: row[1],
    exactCorpusRequired: row[2] === true,
    originalQuestion: row[3],
    wrongResponse: row[4],
    diagnosisPrompt: 'Bạn này sai ở đâu? Sửa thế nào? Vì sao?',
    correctDiagnosis: Object.freeze({
      error: youngLearnerDiagnosisText(row[5]),
      repair: youngLearnerDiagnosisText(row[6]),
      reason: youngLearnerDiagnosisText(row[7])
    })
  }));
  return Object.freeze({ ...raw, items: Object.freeze(items) });
}
