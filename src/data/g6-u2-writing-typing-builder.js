const THEORY_BY_MINDSET = Object.freeze({
  'GÁN': 'MINDSET FIRST → GÁN. Xác định host rồi gán sở hữu, vị trí hoặc đặc điểm bằng surface form đã được cue làm rõ.',
  'AURA': 'MINDSET FIRST → AURA. Dựng cảnh bằng THERE IS / THERE ARE hoặc dạng câu hỏi tương ứng; số lượng quyết định IS / ARE.',
  'HÀNH ĐỘNG XYZ': 'MINDSET FIRST → HÀNH ĐỘNG XYZ. Giữ lexical action core như HAVE / LIVE / READ rồi nối đúng chunk; không chèn BE nếu frame không cần.',
  'MIXED': 'MINDSET FIRST → tách các meaning core trước, sau đó nối main core với reason core bằng BECAUSE.'
});

function engineStage(role) {
  if (role === 'word') return 'word';
  if (role === 'final') return 'sentence';
  return 'phrase';
}

function teachingFeedback(source) {
  return Object.freeze({
    correctLabel: source.targetSentence,
    reason: source.feedbackReason,
    theory: `${THEORY_BY_MINDSET[source.mindset] ?? THEORY_BY_MINDSET.MIXED} Core trọng tâm: ${source.core}.`,
    example: source.targetSentence
  });
}

export function buildG6U2Lesson(key, source, steps) {
  if (!source) throw new Error(`Thiếu source cho G6 U2 Writing lesson ${key}`);
  if (!Array.isArray(steps) || steps.length === 0) throw new Error(`Lesson ${key} phải có ít nhất một scaffold step`);

  const items = steps.map((step, index) => {
    const id = `g6u2-wr-${key}-q${String(index + 1).padStart(2, '0')}`;
    const previousIds = steps.slice(0, index).map((_, previousIndex) => `g6u2-wr-${key}-q${String(previousIndex + 1).padStart(2, '0')}`);
    const item = {
      id,
      stage: engineStage(step.role),
      scaffoldRole: step.role,
      vi: step.vi,
      en: step.en,
      buildsFrom: Object.freeze(previousIds)
    };
    if (step.role === 'final') item.teachingFeedback = teachingFeedback(source);
    return Object.freeze(item);
  });

  const finalItems = items.filter(item => item.scaffoldRole === 'final');
  if (finalItems.length !== 1) throw new Error(`Lesson ${key} phải có đúng một FINAL item`);
  if (finalItems[0].en !== source.targetSentence) throw new Error(`Lesson ${key} FINAL không khớp target sentence`);

  return Object.freeze({
    targetSentenceId: source.id,
    targetSentence: source.targetSentence,
    targetVi: source.targetVi,
    sourceType: source.sourceType,
    sourceNote: source.sourceNote,
    items: Object.freeze(items)
  });
}

export function buildG6U2LessonMap(sourceRecords, specs) {
  const sourceById = new Map(sourceRecords.map(record => [record.id, record]));
  return Object.freeze(Object.fromEntries(Object.entries(specs).map(([key, spec]) => {
    const source = sourceById.get(spec.targetSentenceId);
    return [key, buildG6U2Lesson(key, source, spec.steps)];
  })));
}
