import { G5_REVIEW_U15_SOURCE_SCOPE } from './g5-review-u1-5-source.js';

const TYPING_UI = Object.freeze({
  vocabulary_context_cloze: Object.freeze({
    promptLabel: 'VOCAB CONTEXT CLOZE',
    contextLabel: 'Context',
    instruction: 'Đọc ngữ cảnh và gõ từ/cụm từ tiếng Anh phù hợp vào chỗ trống. Không có word bank hoặc gợi ý.',
    inputLabel: 'Từ/cụm từ còn thiếu',
    placeholder: 'Type the missing word or phrase...'
  }),
  grammar_cloze: Object.freeze({
    promptLabel: 'GRAMMAR CLOZE',
    contextLabel: 'Câu',
    instruction: 'Gõ phần ngữ pháp còn thiếu để hoàn thành câu đúng.',
    inputLabel: 'Phần còn thiếu',
    placeholder: 'Type the missing grammar...'
  }),
  error_correction: Object.freeze({
    promptLabel: 'ERROR CORRECTION',
    contextLabel: 'Câu có lỗi',
    instruction: 'Gõ lại toàn bộ câu sau khi sửa đúng lỗi ngữ pháp.',
    inputLabel: 'Câu đã sửa',
    placeholder: 'Type the corrected sentence...'
  }),
  transformation: Object.freeze({
    promptLabel: 'TRANSFORMATION',
    contextLabel: 'Yêu cầu',
    instruction: 'Biến đổi câu theo yêu cầu và gõ toàn bộ câu hoàn chỉnh.',
    inputLabel: 'Câu sau biến đổi',
    placeholder: 'Type the transformed sentence...'
  }),
  typing_translation: Object.freeze({
    promptLabel: 'TYPING',
    contextLabel: 'Tiếng Việt',
    instruction: 'Dịch sang tiếng Anh.',
    inputLabel: 'Câu trả lời tiếng Anh',
    placeholder: 'Type English here...'
  })
});

function freezeArray(values = []) {
  return Object.freeze([...values]);
}

function commonMeta(spec) {
  return {
    units: freezeArray(spec.units),
    grammarIds: freezeArray(spec.grammarIds),
    vocabIds: freezeArray(spec.vocabIds),
    exerciseKind: spec.kind,
    trapType: spec.trapType,
    mindset: spec.mindset,
    difficulty: spec.difficulty,
    sourceScope: G5_REVIEW_U15_SOURCE_SCOPE
  };
}

function teachingFeedback(correctLabel, spec) {
  return Object.freeze({
    correctLabel,
    reason: spec.reason,
    theory: spec.brain,
    example: spec.example
  });
}

function typingItem(id, spec) {
  return Object.freeze({
    id,
    type: 'typing',
    vi: spec.prompt,
    en: spec.answer,
    typingUi: TYPING_UI[spec.kind],
    teachingFeedback: teachingFeedback(spec.answer, spec),
    ...commonMeta(spec)
  });
}

function mcqItem(id, spec) {
  const choices = spec.choices.map((text, index) => Object.freeze({ id: `c${index + 1}`, text }));
  const correctIndex = spec.choices.indexOf(spec.correct);
  return Object.freeze({
    id,
    type: 'mcq',
    prompt: spec.prompt,
    choices: Object.freeze(choices),
    correctChoiceId: `c${correctIndex + 1}`,
    teachingFeedback: teachingFeedback(spec.correct, spec),
    ...commonMeta(spec)
  });
}

function trueFalseItem(id, spec) {
  return Object.freeze({
    id,
    type: 'true_false',
    statement: spec.statement,
    answer: spec.answer,
    teachingFeedback: teachingFeedback(spec.answer ? 'TRUE' : 'FALSE', spec),
    ...commonMeta(spec)
  });
}

function sentenceOrderItem(id, spec) {
  return Object.freeze({
    id,
    type: 'sentence_order',
    prompt: spec.prompt,
    tokens: freezeArray(spec.tokens),
    correctOrder: freezeArray(spec.correctOrder),
    acceptedOrders: Object.freeze((spec.acceptedOrders ?? [spec.correctOrder]).map(order => freezeArray(order))),
    orderDiagnostics: Object.freeze({
      distractors: Object.freeze(spec.distractors.map(value => Object.freeze({ ...value }))),
      rules: Object.freeze((spec.rules ?? []).map(value => Object.freeze({
        ...value,
        all: freezeArray(value.all),
        none: freezeArray(value.none)
      })))
    }),
    teachingFeedback: teachingFeedback(spec.correctOrder.join(' '), spec),
    ...commonMeta(spec)
  });
}

function classificationItem(id, spec) {
  return Object.freeze({
    id,
    type: 'classification',
    prompt: spec.prompt,
    groups: Object.freeze(spec.groups.map(group => Object.freeze({ id: group.id, label: group.label }))),
    tokens: Object.freeze(spec.tokens.map(token => Object.freeze({
      id: token.id,
      text: token.text,
      correctGroupId: token.group
    }))),
    classificationKind: 'generic',
    teachingFeedback: teachingFeedback(spec.correctLabel, spec),
    ...commonMeta(spec)
  });
}

function buildItem(lessonKey, index, spec) {
  const id = `g5-review-u1-5-${lessonKey}-q${String(index + 1).padStart(2, '0')}`;
  if (spec.kind === 'mcq') return mcqItem(id, spec);
  if (spec.kind === 'true_false') return trueFalseItem(id, spec);
  if (spec.kind === 'sentence_order') return sentenceOrderItem(id, spec);
  if (spec.kind === 'classification') return classificationItem(id, spec);
  return typingItem(id, spec);
}

export function buildG5ReviewU15LessonMap(lessonSpecs) {
  return Object.freeze(Object.fromEntries(
    Object.entries(lessonSpecs).map(([key, specs]) => [
      key,
      Object.freeze({ items: Object.freeze(specs.map((spec, index) => buildItem(key, index, spec))) })
    ])
  ));
}
