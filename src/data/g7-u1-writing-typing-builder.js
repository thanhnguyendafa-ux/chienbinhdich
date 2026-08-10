const THEORY_BY_MINDSET = Object.freeze({
  'GÁN': 'MINDSET FIRST → GÁN. Xác định host bên trái rồi dùng BE phù hợp để gán danh tính, trạng thái hoặc đặc điểm; không chèn action marker khi câu không kể hành động.',
  'AURA': 'MINDSET FIRST → AURA. Dùng cấu trúc dựng cảnh khi ý nghĩa là sự hiện diện; chọn host/marker theo thing xuất hiện.',
  'HÀNH ĐỘNG XYZ': 'MINDSET FIRST → HÀNH ĐỘNG XYZ. Xác định lexical action core trước, rồi mới gắn marker theo host/thời gian/phủ định; tránh double marking.',
  'MIXED': 'MINDSET FIRST → tách từng meaning core, phân loại GÁN / AURA / HÀNH ĐỘNG XYZ riêng trước rồi mới nối bằng and, but, so, because, when hoặc after.'
});

function teachingFeedback(answer, lessonSpec, note) {
  const theory = THEORY_BY_MINDSET[lessonSpec.mindset] ?? THEORY_BY_MINDSET.MIXED;
  const brainRule = lessonSpec.brainRule ? ` ${lessonSpec.brainRule}` : '';
  return Object.freeze({
    correctLabel: answer,
    reason: note,
    theory: `${theory} Core/chunk trọng tâm: ${lessonSpec.core}.${brainRule}`,
    example: answer
  });
}

function typingItem(id, stage, vi, en, buildsFrom = [], teaching = null) {
  const item = { id, stage, vi, en, buildsFrom: Object.freeze([...buildsFrom]) };
  if (teaching) item.teachingFeedback = teaching;
  return Object.freeze(item);
}

function buildLesson(key, lessonSpec) {
  const wordIds = lessonSpec.words.map((_, index) => `${key}-w${index + 1}`);
  const phraseIds = lessonSpec.phrases.map((_, index) => `${key}-p${index + 1}`);
  const items = [];

  lessonSpec.words.forEach(([vi, en], index) => {
    items.push(typingItem(wordIds[index], 'word', vi, en));
  });

  lessonSpec.phrases.forEach(([vi, en], index) => {
    const dependencies = index === 0 ? [wordIds[0]] : index === 1 ? wordIds.slice(0, 2) : wordIds;
    items.push(typingItem(phraseIds[index], 'phrase', vi, en, dependencies));
  });

  lessonSpec.sentences.forEach(([vi, en, note], index) => {
    items.push(typingItem(
      `${key}-s${index + 1}`,
      'sentence',
      vi,
      en,
      phraseIds,
      teachingFeedback(en, lessonSpec, note)
    ));
  });

  return Object.freeze({ items: Object.freeze(items) });
}

export function buildLessonMap(specs) {
  return Object.freeze(
    Object.fromEntries(Object.entries(specs).map(([key, lessonSpec]) => [key, buildLesson(key, lessonSpec)]))
  );
}
