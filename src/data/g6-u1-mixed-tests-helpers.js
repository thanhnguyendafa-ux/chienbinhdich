const freeze = value => Object.freeze(value);

const theorySupport = freeze({ access: 'after_submit' });
const typingUi = freeze({
  promptLabel: 'Dạng bài trong đề',
  contextLabel: 'Câu hỏi',
  instruction: 'Gõ đáp án đúng theo yêu cầu. Sau khi Submit, xem giải thích tiếng Việt để tự sửa.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ đáp án...'
});

const teaching = (correctLabel, reason, theory) => freeze({
  correctLabel,
  reason,
  theory,
  example: `Đáp án đúng: ${correctLabel}`
});

export const stimulus = (title, text) => freeze({ title, text });

export const mcq = ({ id, prompt, options, correctIndex, reason, theory, stimulus: sourceStimulus }) => freeze({
  id,
  type: 'mcq',
  prompt,
  ...(sourceStimulus ? { stimulus: sourceStimulus } : {}),
  choices: freeze(options.map((text, index) => freeze({ id: `c${index + 1}`, text }))),
  correctChoiceId: `c${correctIndex + 1}`,
  theorySupport,
  teachingFeedback: teaching(options[correctIndex], reason, theory)
});

export const typing = ({ id, prompt, answer, acceptedAnswers = [], reason, theory }) => freeze({
  id,
  type: 'typing',
  vi: prompt,
  en: answer,
  ...(acceptedAnswers.length ? { acceptedAnswers: freeze(acceptedAnswers) } : {}),
  typingUi,
  theorySupport,
  teachingFeedback: teaching(answer, reason, theory)
});

export const trueFalse = ({ id, statement, answer, reason, theory, stimulus: sourceStimulus }) => freeze({
  id,
  type: 'true_false',
  statement,
  ...(sourceStimulus ? { stimulus: sourceStimulus } : {}),
  answer,
  theorySupport,
  teachingFeedback: teaching(answer ? 'TRUE' : 'FALSE', reason, theory)
});

export const sentenceOrder = ({ id, prompt, tokens, correctOrder, reason, theory }) => freeze({
  id,
  type: 'sentence_order',
  prompt,
  tokens: freeze(tokens),
  correctOrder: freeze(correctOrder),
  theorySupport,
  teachingFeedback: teaching(correctOrder.join(' '), reason, theory)
});

export const matching = ({ id, prompt, pairs, reason, theory }) => freeze({
  id,
  type: 'matching',
  prompt,
  groups: freeze(pairs.map(([, answer], index) => freeze({ id: `g${index + 1}`, label: answer }))),
  tokens: freeze(pairs.map(([question], index) => freeze({ id: `t${index + 1}`, text: question, correctGroupId: `g${index + 1}` }))),
  classificationKind: 'generic',
  classificationHint: 'Đọc từ hỏi trước, rồi ghép với câu trả lời cùng loại thông tin.',
  theorySupport,
  teachingFeedback: teaching('Ghép đúng tất cả các cặp', reason, theory)
});

export const sequenceNumber = ({ id, prompt, lines, correctOrder, reason, theory }) => freeze({
  id,
  type: 'sequence_number',
  prompt,
  lines: freeze(lines.map(([lineId, text]) => freeze({ id: lineId, text }))),
  correctOrder: freeze(correctOrder),
  theorySupport,
  teachingFeedback: teaching(correctOrder.join(' → '), reason, theory)
});
