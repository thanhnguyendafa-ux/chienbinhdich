const TYPING_UI = Object.freeze({
  grammar_cloze: Object.freeze({ promptLabel: 'GRAMMAR CLOZE', contextLabel: 'Câu', instruction: 'Gõ phần ngữ pháp còn thiếu.', inputLabel: 'Đáp án', placeholder: 'Type the missing grammar...' }),
  error_correction: Object.freeze({ promptLabel: 'ERROR CORRECTION', contextLabel: 'Câu có lỗi', instruction: 'Gõ lại toàn bộ câu sau khi sửa đúng.', inputLabel: 'Câu đã sửa', placeholder: 'Type the corrected sentence...' }),
  transformation: Object.freeze({ promptLabel: 'TRANSFORMATION', contextLabel: 'Yêu cầu', instruction: 'Biến đổi và gõ toàn bộ câu đúng.', inputLabel: 'Câu sau biến đổi', placeholder: 'Type the transformed sentence...' }),
  question_formation: Object.freeze({ promptLabel: 'QUESTION FORMATION', contextLabel: 'Yêu cầu', instruction: 'Viết câu hỏi hoàn chỉnh.', inputLabel: 'Câu hỏi', placeholder: 'Type the question...' }),
  word_form: Object.freeze({ promptLabel: 'WORD FORM', contextLabel: 'Từ/câu gốc', instruction: 'Gõ đúng dạng từ.', inputLabel: 'Dạng đúng', placeholder: 'Type the correct form...' }),
  mixed_verb_form: Object.freeze({ promptLabel: 'MIXED VERB FORM', contextLabel: 'Ngữ cảnh', instruction: 'Gõ các đáp án theo đúng thứ tự, ngăn cách bằng “/”.', inputLabel: 'Đáp án', placeholder: 'answer 1 / answer 2' }),
  word_order_typing: Object.freeze({ promptLabel: 'WORD ORDER', contextLabel: 'Yêu cầu', instruction: 'Gõ lại toàn bộ câu theo đúng trật tự.', inputLabel: 'Câu đúng', placeholder: 'Type the correct sentence...' }),
  short_answer: Object.freeze({ promptLabel: 'SHORT ANSWER', contextLabel: 'Câu hỏi', instruction: 'Gõ câu trả lời ngắn.', inputLabel: 'Câu trả lời', placeholder: 'Type the short answer...' }),
  sentence: Object.freeze({ promptLabel: 'BUILD THE SENTENCE', contextLabel: 'Từ gợi ý', instruction: 'Gõ câu tiếng Anh hoàn chỉnh.', inputLabel: 'Câu trả lời', placeholder: 'Type the full sentence...' }),
  concept_mcq: Object.freeze({}), guided_mcq: Object.freeze({}), rule_mcq: Object.freeze({}), exam_mcq: Object.freeze({})
});

function feedback(answer, reason, stage) {
  return Object.freeze({
    correctLabel: String(answer),
    reason: String(reason || ''),
    theory: `TẦNG SCAFFOLD → ${String(stage || '')}`,
    example: String(answer)
  });
}

export function buildScaffoldItem(raw) {
  const [id, type, subtype, stage, prompt, answer, reason, extra] = raw;
  if (type === 'mcq') {
    const choices = (extra?.choices || []).map((text, index) => Object.freeze({ id: `c${index + 1}`, text: String(text) }));
    return Object.freeze({
      id, type: 'mcq', prompt, choices: Object.freeze(choices), correctChoiceId: 'c1',
      stage, exerciseKind: subtype, teachingFeedback: feedback(answer, reason, stage)
    });
  }
  if (type === 'sentence_order') {
    const correctOrder = Object.freeze([...(extra?.correctOrder || [])]);
    const acceptedOrders = Object.freeze((extra?.acceptedOrders || [correctOrder]).map(order => Object.freeze([...order])));
    return Object.freeze({
      id, type: 'sentence_order', prompt, tokens: Object.freeze([...(extra?.tokens || correctOrder)]),
      correctOrder, acceptedOrders, stage, exerciseKind: subtype,
      teachingFeedback: feedback(answer, reason, stage)
    });
  }
  return Object.freeze({
    id, type: 'typing', vi: prompt, en: answer,
    ...(extra?.acceptedAnswers?.length ? { acceptedAnswers: Object.freeze([...extra.acceptedAnswers]) } : {}),
    ...(subtype === 'mixed_verb_form' ? { typingSeparatorTolerance: true } : {}),
    typingUi: TYPING_UI[subtype] || TYPING_UI.grammar_cloze,
    stage, exerciseKind: subtype, teachingFeedback: feedback(answer, reason, stage)
  });
}

export function buildScaffoldContent(rows) {
  return Object.freeze({ items: Object.freeze(rows.map(buildScaffoldItem)) });
}
