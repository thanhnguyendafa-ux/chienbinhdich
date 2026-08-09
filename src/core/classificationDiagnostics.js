import { questionTypeForItem } from './questionTypes.js';

const LABELS = Object.freeze({
  correct: 'Đúng',
  stress_1_to_2: 'Nhấn âm 1 → âm 2',
  stress_2_to_1: 'Nhấn âm 2 → âm 1',
  vocabulary_group_confusion: 'Nhầm nhóm từ vựng',
  unclassified: 'Thiếu phân loại',
  wrong_group: 'Sai nhóm'
});

export function diagnoseClassification(item, response) {
  if (questionTypeForItem(item) !== 'classification') return null;
  const submitted = normalizeResponse(response);
  const wrong = [];
  const byCode = {};

  for (const token of item?.tokens ?? []) {
    const tokenId = String(token.id);
    const expectedGroupId = String(token.correctGroupId);
    const selectedGroupId = submitted[tokenId];
    if (selectedGroupId === expectedGroupId) continue;
    const code = classificationErrorCode(item, expectedGroupId, selectedGroupId);
    wrong.push(Object.freeze({ tokenId, expectedGroupId, selectedGroupId: selectedGroupId ?? null, code }));
    byCode[code] = (byCode[code] ?? 0) + 1;
  }

  if (!wrong.length) {
    return Object.freeze({ correct: true, wrongCount: 0, wrong: Object.freeze([]), byCode: Object.freeze({}) });
  }

  return Object.freeze({
    correct: false,
    wrongCount: wrong.length,
    wrong: Object.freeze(wrong),
    byCode: Object.freeze({ ...byCode })
  });
}

export function classificationFeedbackHint(item, response) {
  const result = diagnoseClassification(item, response);
  if (!result || result.correct) return '';
  if (item?.classificationHint) return String(item.classificationHint);
  if (item?.classificationKind === 'stress') {
    return 'Có một số từ chưa đúng nhóm. Hãy so sánh các cặp -ty và -teen, rồi nghe/đọc lại âm tiết được nhấn mạnh.';
  }
  if (item?.classificationKind === 'vocabulary') {
    return 'Có một số từ chưa đúng nhóm. Hãy kiểm tra từ nào chỉ nơi ở/tòa nhà và từ nào thường dùng trong địa chỉ.';
  }
  return 'Có một số mục chưa đúng nhóm. Hãy đọc lại tiêu chí của từng nhóm rồi sửa lại.';
}

export function classificationDiagnosticLabel(code) {
  return LABELS[code] ?? String(code ?? '');
}

export function classificationAttemptSummary(item, response) {
  const result = diagnoseClassification(item, response);
  if (!result || result.correct) return '';
  const parts = Object.entries(result.byCode)
    .map(([code, count]) => `${classificationDiagnosticLabel(code)}: ${count}`);
  return `${result.wrongCount} mục sai${parts.length ? ` · ${parts.join(' · ')}` : ''}`;
}

export function deriveClassificationDiagnostics(session, set) {
  const itemById = new Map((set?.items ?? []).map(item => [item.id, item]));
  const attempts = (session?.attempts ?? []).filter(attempt => {
    if (attempt.promptKind !== 'main' || attempt.attemptNumber !== 1) return false;
    return questionTypeForItem(itemById.get(attempt.itemId)) === 'classification';
  });

  let correct = 0;
  let tokenMistakes = 0;
  const byCode = {};
  for (const attempt of attempts) {
    const result = diagnoseClassification(itemById.get(attempt.itemId), attempt.submittedResponse);
    if (!result) continue;
    if (result.correct) {
      correct += 1;
      continue;
    }
    tokenMistakes += result.wrongCount;
    for (const [code, count] of Object.entries(result.byCode)) {
      byCode[code] = (byCode[code] ?? 0) + count;
    }
  }

  const errors = Object.entries(byCode)
    .map(([code, count]) => Object.freeze({ code, count, label: classificationDiagnosticLabel(code) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'vi'));

  return Object.freeze({
    total: attempts.length,
    correct,
    wrong: attempts.length - correct,
    tokenMistakes,
    byCode: Object.freeze({ ...byCode }),
    errors: Object.freeze(errors)
  });
}

function classificationErrorCode(item, expectedGroupId, selectedGroupId) {
  if (selectedGroupId === undefined) return 'unclassified';
  if (item?.classificationKind === 'stress') {
    if (expectedGroupId === 'stress-1' && selectedGroupId === 'stress-2') return 'stress_1_to_2';
    if (expectedGroupId === 'stress-2' && selectedGroupId === 'stress-1') return 'stress_2_to_1';
  }
  if (item?.classificationKind === 'vocabulary') return 'vocabulary_group_confusion';
  return 'wrong_group';
}

function normalizeResponse(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, groupId]) => [String(key), String(groupId)]));
}
