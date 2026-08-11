import {
  G6_REVIEW_U13_SOURCE_SCOPE,
  g6ReviewU13ExerciseSeeds,
  g6ReviewU13Phrases
} from './g6-review-u1-3-source.js';

const SOURCE_BY_ID = new Map(g6ReviewU13ExerciseSeeds.map(item => [item.id, item]));

function inferPhraseIds(seed) {
  const haystack = `${seed.prompt} ${seed.answer}`.toLowerCase();
  return g6ReviewU13Phrases
    .filter(item => item.phrase && haystack.includes(String(item.phrase).toLowerCase()))
    .map(item => item.id);
}

const TYPING_UI = Object.freeze({
  grammar_cloze: Object.freeze({
    promptLabel: 'GRAMMAR CLOZE', contextLabel: 'Câu', instruction: 'Gõ phần ngữ pháp còn thiếu để hoàn thành câu đúng.',
    inputLabel: 'Phần còn thiếu', placeholder: 'Type the missing grammar...'
  }),
  error_correction: Object.freeze({
    promptLabel: 'ERROR CORRECTION', contextLabel: 'Câu có lỗi', instruction: 'Gõ lại toàn bộ câu sau khi sửa đúng lỗi ngữ pháp.',
    inputLabel: 'Câu đã sửa', placeholder: 'Type the corrected sentence...'
  }),
  transformation: Object.freeze({
    promptLabel: 'TRANSFORMATION', contextLabel: 'Yêu cầu', instruction: 'Biến đổi câu theo yêu cầu và gõ toàn bộ câu hoàn chỉnh.',
    inputLabel: 'Câu sau biến đổi', placeholder: 'Type the transformed sentence...'
  }),
  question_formation: Object.freeze({
    promptLabel: 'QUESTION FORMATION', contextLabel: 'Câu gốc', instruction: 'Viết câu hỏi đúng theo yêu cầu.',
    inputLabel: 'Câu hỏi', placeholder: 'Type the question...'
  }),
  typing_translation: Object.freeze({
    promptLabel: 'TYPING · VIỆT → ANH', contextLabel: 'Tiếng Việt', instruction: 'Dịch sang tiếng Anh.',
    inputLabel: 'Câu tiếng Anh', placeholder: 'Type English here...'
  }),
  word_form: Object.freeze({
    promptLabel: 'WORD FORM', contextLabel: 'Từ gốc', instruction: 'Gõ đúng dạng từ được yêu cầu.',
    inputLabel: 'Dạng đúng', placeholder: 'Type the correct form...'
  }),
  mixed_verb_form: Object.freeze({
    promptLabel: 'MIXED VERB FORM', contextLabel: 'Ngữ cảnh', instruction: 'Đọc marker nghĩa trước rồi gõ các dạng động từ theo đúng thứ tự, ngăn cách bằng dấu chấm phẩy nếu có nhiều chỗ trống.',
    inputLabel: 'Đáp án', placeholder: 'Type the verb form(s)...'
  }),
  contextual_cloze: Object.freeze({
    promptLabel: 'CONTEXTUAL CLOZE', contextLabel: 'Context', instruction: 'Đọc toàn bộ ngữ cảnh rồi gõ phần còn thiếu. Không có word bank.',
    inputLabel: 'Đáp án', placeholder: 'Type the missing form...'
  }),
  word_order_typing: Object.freeze({
    promptLabel: 'WORD ORDER', contextLabel: 'Yêu cầu', instruction: 'Gõ lại toàn bộ câu với vị trí từ/cụm đúng.',
    inputLabel: 'Câu đúng', placeholder: 'Type the corrected order...'
  })
});

const freezeArray = values => Object.freeze([...(values ?? [])]);

function commonMeta(spec, defaults) {
  return {
    units: freezeArray(spec.units ?? defaults.units),
    grammarFamilies: freezeArray(spec.grammarFamilies ?? defaults.grammarFamilies),
    microSkillIds: freezeArray(spec.microSkillIds ?? defaults.microSkillIds),
    trapIds: freezeArray(spec.trapIds ?? defaults.trapIds),
    phraseIds: freezeArray(spec.phraseIds ?? []),
    sourceExerciseIds: freezeArray(spec.sourceExerciseIds ?? []),
    exerciseKind: spec.kind,
    mindset: spec.mindset ?? defaults.mindset,
    difficulty: spec.difficulty ?? defaults.difficulty,
    authoredExtension: spec.authoredExtension === true,
    sourceScope: G6_REVIEW_U13_SOURCE_SCOPE
  };
}

function feedback(answer, reason, brain, example = '') {
  const theory = String(brain ?? '').startsWith('MINDSET FIRST') ? String(brain) : `MINDSET FIRST → ${String(brain ?? '')}`;
  return Object.freeze({
    correctLabel: String(answer),
    reason: String(reason ?? ''),
    theory,
    example: String(example || answer)
  });
}

function parseChoices(text) {
  const parts = String(text ?? '').split('|').map(value => value.trim()).filter(Boolean);
  return parts.map(value => value.replace(/^[A-Z]\.\s*/i, '').trim());
}

function sourceKind(seed) {
  return ({
    'MCQ': 'mcq',
    'Fill in the blank': 'grammar_cloze',
    'Error correction': 'error_correction',
    'Vietnamese → English': 'typing_translation',
    'Mixed verb form': 'mixed_verb_form',
    'Question formation': 'question_formation',
    'Sentence transformation': 'transformation',
    'Word form': 'word_form',
    'Word order': 'word_order_typing',
    'Contextual cloze': 'contextual_cloze'
  })[seed.exerciseType] ?? 'grammar_cloze';
}

function sourceItem(id, ref, defaults) {
  const seed = SOURCE_BY_ID.get(ref.seed);
  if (!seed) throw new Error(`Unknown G6 source seed: ${ref.seed}`);
  const kind = sourceKind(seed);
  const base = {
    units: ref.units,
    grammarFamilies: ref.grammarFamilies,
    microSkillIds: ref.microSkillIds,
    trapIds: ref.trapIds,
    phraseIds: ref.phraseIds ?? inferPhraseIds(seed),
    sourceExerciseIds: [seed.id],
    kind,
    mindset: ref.mindset,
    difficulty: ref.difficulty,
    authoredExtension: false
  };

  if (kind === 'mcq') {
    const choices = parseChoices(seed.options);
    const correctIndex = choices.indexOf(seed.answer);
    if (correctIndex < 0) throw new Error(`Cannot resolve MCQ answer for ${seed.id}`);
    return Object.freeze({
      id, type: 'mcq', prompt: seed.prompt,
      choices: Object.freeze(choices.map((text, index) => Object.freeze({ id: `c${index + 1}`, text }))),
      correctChoiceId: `c${correctIndex + 1}`,
      teachingFeedback: feedback(seed.answer, seed.explanation, seed.brain, seed.answer),
      ...commonMeta(base, defaults)
    });
  }

  return Object.freeze({
    id, type: 'typing', vi: seed.prompt, en: seed.answer,
    typingUi: TYPING_UI[kind],
    teachingFeedback: feedback(seed.answer, seed.explanation, seed.brain, seed.answer),
    ...commonMeta(base, defaults)
  });
}

function customItem(id, spec, defaults) {
  const meta = commonMeta({ ...spec, authoredExtension: true }, defaults);
  if (spec.kind === 'mcq') {
    const choices = spec.choices.map((text, index) => Object.freeze({ id: `c${index + 1}`, text }));
    const correctIndex = spec.choices.indexOf(spec.correct);
    if (correctIndex < 0) throw new Error(`Custom MCQ ${id} missing correct choice`);
    return Object.freeze({
      id, type: 'mcq', prompt: spec.prompt, choices: Object.freeze(choices), correctChoiceId: `c${correctIndex + 1}`,
      teachingFeedback: feedback(spec.correct, spec.reason, spec.brain, spec.example), ...meta
    });
  }
  if (spec.kind === 'true_false') {
    return Object.freeze({
      id, type: 'true_false', statement: spec.statement, answer: spec.answer,
      teachingFeedback: feedback(spec.answer ? 'TRUE' : 'FALSE', spec.reason, spec.brain, spec.example), ...meta
    });
  }
  if (spec.kind === 'sentence_order') {
    return Object.freeze({
      id, type: 'sentence_order', prompt: spec.prompt,
      tokens: freezeArray(spec.tokens), correctOrder: freezeArray(spec.correctOrder),
      acceptedOrders: Object.freeze((spec.acceptedOrders ?? [spec.correctOrder]).map(order => freezeArray(order))),
      orderDiagnostics: Object.freeze({
        distractors: Object.freeze((spec.distractors ?? []).map(item => Object.freeze({ ...item }))),
        rules: Object.freeze((spec.rules ?? []).map(rule => Object.freeze({
          ...rule, all: freezeArray(rule.all), none: freezeArray(rule.none)
        })))
      }),
      teachingFeedback: feedback(spec.correctOrder.join(' '), spec.reason, spec.brain, spec.example), ...meta
    });
  }
  if (spec.kind === 'classification') {
    return Object.freeze({
      id, type: 'classification', prompt: spec.prompt,
      groups: Object.freeze(spec.groups.map(group => Object.freeze({ id: group.id, label: group.label, ...(group.helper ? { helper: group.helper } : {}) }))),
      tokens: Object.freeze(spec.tokens.map(token => Object.freeze({ id: token.id, text: token.text, correctGroupId: token.group }))),
      classificationKind: 'generic',
      teachingFeedback: feedback(spec.correctLabel, spec.reason, spec.brain, spec.example), ...meta
    });
  }
  return Object.freeze({
    id, type: 'typing', vi: spec.prompt, en: spec.answer,
    typingUi: TYPING_UI[spec.kind] ?? TYPING_UI.grammar_cloze,
    teachingFeedback: feedback(spec.answer, spec.reason, spec.brain, spec.example), ...meta
  });
}

export function buildG6ReviewU13LessonMap(lessonSpecs) {
  return Object.freeze(Object.fromEntries(Object.entries(lessonSpecs).map(([key, lesson]) => {
    const defaults = {
      units: lesson.units,
      grammarFamilies: lesson.grammarFamilies,
      microSkillIds: lesson.microSkillIds,
      trapIds: lesson.trapIds,
      mindset: lesson.mindset,
      difficulty: lesson.difficulty
    };
    const items = lesson.items.map((entry, index) => {
      const id = `g6-review-u1-3-${key}-q${String(index + 1).padStart(2, '0')}`;
      return entry.seed ? sourceItem(id, entry, defaults) : customItem(id, entry, defaults);
    });
    return [key, Object.freeze({ items: Object.freeze(items) })];
  })));
}
