export const READING_DIAGNOSTIC_CODES = Object.freeze([
  'right_verdict_wrong_reason',
  'wrong_verdict_right_evidence',
  'wrong_verdict_wrong_reason'
]);

export function selectedReadingChoice(item, submittedResponse) {
  if (!item?.passageId || !Array.isArray(item?.choices)) return null;
  return item.choices.find(choice => String(choice.id) === String(submittedResponse)) ?? null;
}

export function deriveReadingDiagnostics(session = {}, set = {}) {
  const items = Array.isArray(set?.items) ? set.items : [];
  const itemById = new Map(items.map(item => [item.id, item]));
  const firstMainAttemptByItem = new Map();

  for (const attempt of session?.attempts ?? []) {
    if (attempt?.promptKind !== 'main') continue;
    if (Number(attempt?.attemptNumber ?? 1) !== 1) continue;
    const item = itemById.get(attempt.itemId);
    if (!item?.passageId || firstMainAttemptByItem.has(item.id)) continue;
    firstMainAttemptByItem.set(item.id, attempt);
  }

  const counts = {
    correctVerdictCorrectReason: 0,
    rightVerdictWrongReason: 0,
    wrongVerdictRightEvidence: 0,
    wrongVerdictWrongReason: 0,
    total: 0
  };

  const byErrorCode = {};
  const details = [];

  for (const [itemId, attempt] of firstMainAttemptByItem) {
    const item = itemById.get(itemId);
    const choice = selectedReadingChoice(item, attempt.submittedResponse);
    const diagnostic = choice?.diagnostic ?? null;
    if (!diagnostic) continue;
    counts.total += 1;
    if (diagnostic.verdictCorrect && diagnostic.reasonCorrect) counts.correctVerdictCorrectReason += 1;
    else if (diagnostic.verdictCorrect) counts.rightVerdictWrongReason += 1;
    else if (diagnostic.reasonCorrect) counts.wrongVerdictRightEvidence += 1;
    else counts.wrongVerdictWrongReason += 1;
    if (diagnostic.errorCode) byErrorCode[diagnostic.errorCode] = (byErrorCode[diagnostic.errorCode] ?? 0) + 1;
    details.push(Object.freeze({
      itemId,
      passageId: item.passageId,
      choiceId: choice.id,
      verdictCorrect: diagnostic.verdictCorrect,
      reasonCorrect: diagnostic.reasonCorrect,
      errorCode: diagnostic.errorCode ?? null
    }));
  }

  return Object.freeze({
    ...counts,
    byErrorCode: Object.freeze({ ...byErrorCode }),
    details: Object.freeze(details)
  });
}

export function readingFeedbackHint(item, submittedText) {
  if (!item?.passageId || !Array.isArray(item?.choices)) return null;
  const choice = item.choices.find(candidate => String(candidate.text) === String(submittedText));
  const diagnostic = choice?.diagnostic;
  if (!diagnostic || (diagnostic.verdictCorrect && diagnostic.reasonCorrect)) return null;
  if (diagnostic.verdictCorrect) {
    return 'Con xác định True/False đúng, nhưng lý do chưa chứng minh được nhận định. Hãy tìm đúng câu trong bài làm bằng chứng.';
  }
  if (diagnostic.reasonCorrect) {
    return 'Con đã chạm đúng dữ kiện liên quan, nhưng kết luận True/False đang bị đảo. Hãy đọc lại quan hệ giữa dữ kiện và nhận định.';
  }
  return 'Cả kết luận và lý do chưa khớp bài đọc. Hãy quay lại đoạn có từ khóa chính rồi kiểm tra ai, việc gì và vì sao.';
}
