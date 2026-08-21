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
    diagnosisPrompt: 'Bạn này sai ở đâu, nên sửa lại thế nào và vì sao?',
    correctDiagnosis: Object.freeze({ error: row[5], repair: row[6], reason: row[7] })
  }));
  return Object.freeze({ ...raw, items: Object.freeze(items) });
}
