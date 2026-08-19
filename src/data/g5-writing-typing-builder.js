function engineStage(role) {
  return role === 'final' ? 'sentence' : 'phrase';
}

function buildTeachingFeedback(source, unitLabel) {
  return Object.freeze({
    correctLabel: source.targetSentence,
    reason: source.feedbackReason,
    theory: `${unitLabel} target-first: học đúng WORD/PHRASE của câu đích → tự dựng FINAL. Có thể có cách tiếng Anh khác; bài này chấm câu đích Global Success đang luyện.`,
    example: source.targetSentence
  });
}

export function buildG5TargetFirstLesson({ key, source, steps, itemPrefix, unitLabel }) {
  const finals = steps.filter(step => step.role === 'final');
  if (finals.length !== 1) throw new Error(`${unitLabel} ${key} must contain exactly one FINAL`);
  if (finals[0].en !== source.targetSentence) throw new Error(`${unitLabel} ${key} FINAL must match source target`);
  if (finals[0].vi !== source.targetVi) throw new Error(`${unitLabel} ${key} FINAL Vietnamese cue must match source targetVi`);
  return Object.freeze({
    id: `${itemPrefix}-${key}`,
    targetSentenceId: source.id,
    items: Object.freeze(steps.map((step, index) => Object.freeze({
      id: `${itemPrefix}-${key}-q${String(index + 1).padStart(2, '0')}`,
      type: 'typing',
      stage: engineStage(step.role),
      scaffoldRole: step.role,
      vi: step.vi,
      en: step.en,
      buildsFrom: Object.freeze(step.buildsFrom ?? []),
      ...(step.role === 'final' ? { teachingFeedback: buildTeachingFeedback(source, unitLabel) } : {})
    })))
  });
}

export function buildG5TargetFirstLessonMap({ sourceRecords, specs, itemPrefix, unitLabel }) {
  return Object.freeze(Object.fromEntries(sourceRecords.map(source => {
    const key = String(source.order).padStart(2, '0');
    const steps = specs[key];
    if (!steps) throw new Error(`${unitLabel} missing lesson spec ${key}`);
    return [key, buildG5TargetFirstLesson({ key, source, steps, itemPrefix, unitLabel })];
  })));
}
