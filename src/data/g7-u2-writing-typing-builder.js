const THEORY_BY_MINDSET = Object.freeze({
  'GÁN': 'MINDSET FIRST → GÁN. Xác định host rồi gán đặc điểm/lợi ích bằng đúng surface form đã được cue làm rõ.',
  'HÀNH ĐỘNG XYZ': 'MINDSET FIRST → HÀNH ĐỘNG XYZ. Xác định action core trước, sau đó nối modal, object, frequency, place, purpose hoặc result chunk; không chèn BE nếu frame không cần.',
  'MIXED': 'MINDSET FIRST → tách từng meaning core trước, sau đó nối các core bằng linker thật của target như SO.'
});

function engineStage(role) {
  // G7 U2 preserves authored pedagogical order through scaffoldRole.
  // The repository validator requires engine stages to be non-decreasing, while
  // locked lessons may intentionally place a WORD after a CHUNK. Therefore all
  // pre-FINAL scaffolds use engine stage `phrase`; FINAL uses `sentence`.
  return role === 'final' ? 'sentence' : 'phrase';
}

function teachingFeedback(source) {
  return Object.freeze({
    correctLabel: source.targetSentence,
    reason: source.feedbackReason,
    theory: `${THEORY_BY_MINDSET[source.mindset] ?? THEORY_BY_MINDSET['HÀNH ĐỘNG XYZ']} Core trọng tâm: ${source.core}.`,
    example: source.targetSentence
  });
}

export function buildG7U2Lesson(key, source, steps) {
  if (!source) throw new Error(`Thiếu source cho G7 U2 Writing lesson ${key}`);
  if (!Array.isArray(steps) || steps.length === 0) throw new Error(`Lesson ${key} phải có ít nhất một scaffold step`);

  const items = steps.map((step, index) => {
    const id = `g7u2-wr-${key}-q${String(index + 1).padStart(2, '0')}`;
    const previousIds = steps.slice(0, index).map((_, previousIndex) => `g7u2-wr-${key}-q${String(previousIndex + 1).padStart(2, '0')}`);
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
    sourceTrace: source.sourceTrace,
    sourceNote: source.sourceNote,
    items: Object.freeze(items)
  });
}

export function buildG7U2LessonMap(sourceRecords, specs) {
  const sourceById = new Map(sourceRecords.map(record => [record.id, record]));
  return Object.freeze(Object.fromEntries(Object.entries(specs).map(([key, spec]) => {
    const source = sourceById.get(spec.targetSentenceId);
    return [key, buildG7U2Lesson(key, source, spec.steps)];
  })));
}
