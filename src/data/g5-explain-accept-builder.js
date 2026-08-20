const freeze = Object.freeze;

export function buildG5ExplainAcceptContent({ unitNumber, unitLabel, raw }) {
  const lessons = freeze(Object.fromEntries(raw.map(([key, title, rows]) => [key, freeze({
    id: `g5-u${unitNumber}-writing-${key}`,
    title,
    items: freeze(rows.map(([stage, scaffoldRole, vi, en], index) => freeze({
      id: `g5u${unitNumber}-wr-${key}-q${String(index + 1).padStart(2, '0')}`,
      type: 'typing', stage, scaffoldRole, vi, en,
      acceptAfterSubmit: true,
      buildsFrom: freeze([]),
      teachingFeedback: freeze({
        correctLabel: en,
        reason: explainTarget({ vi, en, scaffoldRole }),
        theory: `${unitLabel}: đáp án được khóa cục bộ theo câu đích; trước Submit không có gợi ý.`,
        example: en
      })
    })))
  })])));
  const meta = freeze(Object.entries(lessons).map(([key, lesson], index) => freeze({
    key, order: index + 1, title: lesson.title, itemCount: lesson.items.length
  })));
  return freeze({
    lessons,
    meta,
    get(id) {
      const key = String(id).toLowerCase().padStart(2, '0');
      const content = lessons[key];
      if (!content) throw new Error(`Unknown G5 U${unitNumber} Writing Typing lesson: ${id}`);
      return content;
    }
  });
}

function explainTarget({ vi, en, scaffoldRole }) {
  const lower = String(en).toLowerCase();
  if (scaffoldRole === 'pronoun' || /^(?:he|she|it|they)(?:\b|['’])/i.test(String(en))) {
    return `Câu noun/tên đầy đủ đã được học trước. Ở câu này, pronoun được dùng đúng theo câu đích: ${en}`;
  }
  if (/\bdoes(?:n't| not)?\b/.test(lower) && /\blike\b/.test(lower)) {
    return `Câu đích có does/doesn't nên động từ dùng like, không dùng likes. Đáp án của bài này là: ${en}`;
  }
  if (/\blikes\b/.test(lower) && /\b(?:doing|reading|playing|solving|drawing|singing|dancing)\b/.test(lower)) {
    return `Câu đích dùng likes + V-ing. Vì vậy bài này khóa đúng dạng đang cần: ${en}`;
  }
  if (/^did\b/.test(lower) || /\bdid\b.*\?/.test(lower)) {
    return `Câu hỏi quá khứ dùng did; động từ chính trở về dạng gốc theo câu đích. Đáp án bài này là: ${en}`;
  }
  if (/\b(?:was|were|went|played|watched|visited|had|took|saw|bought|ate|drank|made)\b/.test(lower)) {
    return `Câu đích đang luyện ngôn ngữ quá khứ của Unit. Bài này yêu cầu đúng dạng đã chia trong câu: ${en}`;
  }
  return `Trong bài này, “${vi}” được dùng là “${en}” để khớp đúng từ/cụm/câu đích của Unit. Ngữ cảnh khác có thể có cách diễn đạt khác.`;
}
