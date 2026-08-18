function engineStage(role) {
  return role === 'final' ? 'sentence' : 'phrase';
}

function teachingFeedback(source) {
  return Object.freeze({
    correctLabel: source.targetSentence,
    reason: source.feedbackReason,
    theory: 'Dựng câu từ đơn vị nhỏ: NHÌN & CHÉP → NHỚ LẠI → CHUNK → BUILD → FINAL. Không thêm từ ngoài những chunk đã luyện trong bài.',
    example: source.targetSentence
  });
}

export function buildG5U1Lesson(key, source, steps) {
  if (!source) throw new Error(`Thiếu source cho G5 U1 Writing lesson ${key}`);
  if (!Array.isArray(steps) || steps.length === 0) throw new Error(`Lesson ${key} phải có ít nhất một scaffold step`);

  const items = steps.map((step, index) => {
    const id = `g5u1-wr-${key}-q${String(index + 1).padStart(2, '0')}`;
    const previousIds = steps.slice(0, index).map((_, previousIndex) => `g5u1-wr-${key}-q${String(previousIndex + 1).padStart(2, '0')}`);
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

  const finals = items.filter(item => item.scaffoldRole === 'final');
  if (finals.length !== 1) throw new Error(`Lesson ${key} phải có đúng một FINAL item`);
  if (finals[0].en !== source.targetSentence) throw new Error(`Lesson ${key} FINAL không khớp target sentence`);

  return Object.freeze({
    targetSentenceId: source.id,
    targetSentence: source.targetSentence,
    targetVi: source.targetVi,
    items: Object.freeze(items)
  });
}

export function buildG5U1LessonMap(sourceRecords, specs) {
  const sourceById = new Map(sourceRecords.map(record => [record.id, record]));
  return Object.freeze(Object.fromEntries(Object.entries(specs).map(([key, spec]) => [
    key,
    buildG5U1Lesson(key, sourceById.get(spec.targetSentenceId), spec.steps)
  ])));
}
