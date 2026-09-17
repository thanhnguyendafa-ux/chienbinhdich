const freeze = value => Object.freeze(value);

const theorySupport = freeze({ access: 'after_submit' });
const typingUi = freeze({
  promptLabel: 'Dạng bài trong đề',
  contextLabel: 'Câu hỏi',
  instruction: 'Gõ đáp án đúng theo yêu cầu. Sau khi Submit, xem phần chữa có Hiểu câu / Meaning, Vì sao / Why và Quy tắc / Rule để tự sửa.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ đáp án...'
});

const defaultMeaning = Object.freeze({
  mcq: 'Đọc toàn bộ câu hỏi và chọn phương án làm cho câu đúng nghĩa và đúng cấu trúc. / Read the whole question and choose the option that makes the meaning and grammar correct.',
  typing: 'Hoàn thành câu theo đúng ý nghĩa và cấu trúc được hỏi. / Complete the sentence with the meaning and grammar required by the question.',
  true_false: 'So sánh ý của câu nhận định với thông tin trong đoạn đọc. / Compare the statement meaning with the evidence in the reading passage.',
  sentence_order: 'Sắp xếp các từ để câu vừa đúng nghĩa vừa đúng trật tự ngữ pháp. / Reorder the words so the sentence is meaningful and grammatical.',
  matching: 'Ghép câu hỏi với câu trả lời cung cấp đúng loại thông tin. / Match each question with the answer that gives the required information.',
  sequence_number: 'Sắp xếp các lượt lời theo logic hội thoại tự nhiên. / Put the lines in a natural conversation order.'
});

const teaching = ({ correctLabel, meaning, fallbackMeaning, reason, theory }) => freeze({
  correctLabel,
  reason: `Hiểu câu / Meaning: ${meaning || fallbackMeaning}`,
  theory: `Vì sao / Why: ${reason} Quy tắc / Rule: ${theory}`,
  example: `Đáp án đúng / Correct answer: ${correctLabel}`
});

export const stimulus = (title, text) => freeze({ title, text });

export const mcq = ({ id, prompt, options, correctIndex, meaning, reason, theory, stimulus: sourceStimulus }) => freeze({
  id,
  type: 'mcq',
  prompt,
  ...(sourceStimulus ? { stimulus: sourceStimulus } : {}),
  choices: freeze(options.map((text, index) => freeze({ id: `c${index + 1}`, text }))),
  correctChoiceId: `c${correctIndex + 1}`,
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: options[correctIndex],
    meaning,
    fallbackMeaning: defaultMeaning.mcq,
    reason,
    theory
  })
});

export const typing = ({ id, prompt, answer, acceptedAnswers = [], meaning, reason, theory }) => freeze({
  id,
  type: 'typing',
  vi: prompt,
  en: answer,
  ...(acceptedAnswers.length ? { acceptedAnswers: freeze(acceptedAnswers) } : {}),
  typingUi,
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: answer,
    meaning,
    fallbackMeaning: defaultMeaning.typing,
    reason,
    theory
  })
});

export const trueFalse = ({ id, statement, answer, meaning, reason, theory, stimulus: sourceStimulus }) => freeze({
  id,
  type: 'true_false',
  statement,
  ...(sourceStimulus ? { stimulus: sourceStimulus } : {}),
  answer,
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: answer ? 'TRUE' : 'FALSE',
    meaning,
    fallbackMeaning: defaultMeaning.true_false,
    reason,
    theory
  })
});

export const sentenceOrder = ({ id, prompt, tokens, correctOrder, meaning, reason, theory }) => freeze({
  id,
  type: 'sentence_order',
  prompt,
  tokens: freeze(tokens),
  correctOrder: freeze(correctOrder),
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: correctOrder.join(' '),
    meaning,
    fallbackMeaning: defaultMeaning.sentence_order,
    reason,
    theory
  })
});

export const matching = ({ id, prompt, pairs, meaning, reason, theory }) => freeze({
  id,
  type: 'matching',
  prompt,
  groups: freeze(pairs.map(([, answer], index) => freeze({ id: `g${index + 1}`, label: answer }))),
  tokens: freeze(pairs.map(([question], index) => freeze({ id: `t${index + 1}`, text: question, correctGroupId: `g${index + 1}` }))),
  classificationKind: 'generic',
  classificationHint: 'Đọc từ hỏi trước, rồi ghép với câu trả lời cùng loại thông tin.',
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: 'Ghép đúng tất cả các cặp',
    meaning,
    fallbackMeaning: defaultMeaning.matching,
    reason,
    theory
  })
});

export const sequenceNumber = ({ id, prompt, lines, correctOrder, meaning, reason, theory }) => freeze({
  id,
  type: 'sequence_number',
  prompt,
  lines: freeze(lines.map(([lineId, text]) => freeze({ id: lineId, text }))),
  correctOrder: freeze(correctOrder),
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: correctOrder.join(' → '),
    meaning,
    fallbackMeaning: defaultMeaning.sequence_number,
    reason,
    theory
  })
});
