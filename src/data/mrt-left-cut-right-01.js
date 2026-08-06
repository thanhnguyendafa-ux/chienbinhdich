const THEORY = Object.freeze({
  left: 'LEFT = SUBJECT. Hỏi WHO / WHAT? để tìm toàn bộ người hoặc vật mà câu đang nói tới.',
  cut: 'CUT | đặt ngay trước RIGHT / PREDICATE. Predicate bắt đầu từ động từ hoặc trợ động từ đầu tiên của phần vị ngữ.',
  right: 'RIGHT = toàn bộ PREDICATE: phần câu nói gì về Subject. RIGHT không phải chỉ là Object ở cuối câu.'
});

const BASE_EXAMPLES = Object.freeze({
  left: 'Nam | eats an apple.',
  cut: 'Nam | is tall.',
  right: 'Nam | is a student.'
});

const LEFT_TYPING_UI = Object.freeze({
  promptLabel: 'Gõ phần TRÁI / SUBJECT',
  contextLabel: 'Câu',
  instruction: 'Gõ phần TRÁI / SUBJECT.',
  inputLabel: 'Phần TRÁI / SUBJECT',
  placeholder: 'Gõ phần TRÁI...'
});

function itemId(number) {
  return `mrt-lcr-q${String(number).padStart(2, '0')}`;
}

function choices(entries) {
  return entries.map(([id, text]) => ({ id, text }));
}

function teaching(skill, correctLabel, reason, worked, example = BASE_EXAMPLES[skill]) {
  return {
    correctLabel,
    reason,
    theory: THEORY[skill],
    workedExample: {
      label: 'Cách chặt đúng',
      text: worked
    },
    example
  };
}

function mcq(number, spec) {
  const correctText = spec.choiceEntries.find(([id]) => id === spec.correctChoiceId)?.[1] ?? '';
  return {
    id: itemId(number),
    type: 'mcq',
    skill: spec.skill,
    sourceItem: spec.sourceItem,
    prompt: `Cho câu: “${spec.sentence}” ${spec.question}`,
    choices: choices(spec.choiceEntries),
    correctChoiceId: spec.correctChoiceId,
    teachingFeedback: teaching(spec.skill, correctText, spec.reason, spec.worked)
  };
}

function trueFalse(number, spec) {
  return {
    id: itemId(number),
    type: 'true_false',
    skill: spec.skill,
    sourceItem: spec.sourceItem,
    statement: `Cho câu: “${spec.sentence}” Nhận định: ${spec.claim}`,
    answer: spec.answer,
    teachingFeedback: teaching(spec.skill, spec.answer ? 'TRUE' : 'FALSE', spec.reason, spec.worked)
  };
}

function typing(number, spec) {
  return {
    id: itemId(number),
    type: 'typing',
    skill: 'left',
    sourceItem: spec.sourceItem,
    vi: spec.sentence,
    en: spec.subject,
    typingUi: LEFT_TYPING_UI,
    teachingFeedback: teaching('left', spec.subject, spec.reason, spec.worked)
  };
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

const items = [
  mcq(1, {
    skill: 'left',
    sourceItem: 2,
    sentence: "The library user knows the author's name.",
    question: 'LEFT / SUBJECT là phần nào?',
    choiceEntries: [
      ['left-full', 'The library user'],
      ['left-partial', 'The library'],
      ['predicate', "knows the author's name"]
    ],
    correctChoiceId: 'left-full',
    reason: 'Câu đang nói về toàn bộ “the library user”. “The library” chỉ là một phần của cụm Subject.',
    worked: "The library user | knows the author's name."
  }),
  trueFalse(2, {
    skill: 'cut',
    sourceItem: 5,
    sentence: 'The library user checks the shelf mark.',
    claim: '“The library user | checks the shelf mark.” là cách chặt đúng.',
    answer: true,
    reason: 'Predicate bắt đầu từ động từ “checks”, vì vậy dấu | đứng ngay trước “checks”.',
    worked: 'The library user | checks the shelf mark.'
  }),
  mcq(3, {
    skill: 'right',
    sourceItem: 6,
    sentence: 'The library user writes down the shelf mark.',
    question: 'RIGHT / PREDICATE là phần nào?',
    choiceEntries: [
      ['right-full', 'writes down the shelf mark'],
      ['right-verb-only', 'writes down'],
      ['object-only', 'the shelf mark']
    ],
    correctChoiceId: 'right-full',
    reason: 'RIGHT phải gồm toàn bộ điều câu nói về Subject: hành động “writes down” và phần đi cùng “the shelf mark”.',
    worked: 'The library user | writes down the shelf mark.'
  }),
  typing(4, {
    sourceItem: 3,
    sentence: 'The library user uses the author catalogue.',
    subject: 'The library user',
    reason: 'Câu đang nói về “the library user”, nên toàn bộ cụm này là LEFT / SUBJECT.',
    worked: 'The library user | uses the author catalogue.'
  }),
  mcq(5, {
    skill: 'cut',
    sourceItem: 1,
    sentence: 'A library user wants to find a book in a library.',
    question: 'Đặt dấu | đúng ở đâu?',
    choiceEntries: [
      ['cut-inside-subject', 'A library | user wants to find a book in a library.'],
      ['cut-before-first-verb', 'A library user | wants to find a book in a library.'],
      ['cut-before-second-verb', 'A library user wants to | find a book in a library.']
    ],
    correctChoiceId: 'cut-before-first-verb',
    reason: 'Predicate bắt đầu ở động từ đầu tiên “wants”. “find” là động từ nằm sau “wants to”, nên không phải điểm bắt đầu của RIGHT.',
    worked: 'A library user | wants to find a book in a library.'
  }),
  trueFalse(6, {
    skill: 'left',
    sourceItem: 4,
    sentence: 'The library user finds the book title in the author catalogue.',
    claim: 'LEFT / SUBJECT của câu là “The library”.',
    answer: false,
    reason: 'Subject đầy đủ là “The library user”. Nếu chỉ lấy “The library” thì đã cắt mất head noun “user”.',
    worked: 'The library user | finds the book title in the author catalogue.'
  }),
  typing(7, {
    sourceItem: 10,
    sentence: 'The library has no title catalogue.',
    subject: 'The library',
    reason: 'Câu đang nói về “the library”, nên “The library” là LEFT / SUBJECT.',
    worked: 'The library | has no title catalogue.'
  }),
  mcq(8, {
    skill: 'right',
    sourceItem: 11,
    sentence: 'The library user uses the subject catalogue.',
    question: 'RIGHT / PREDICATE là phần nào?',
    choiceEntries: [
      ['right-full', 'uses the subject catalogue'],
      ['verb-only', 'uses'],
      ['object-only', 'the subject catalogue']
    ],
    correctChoiceId: 'right-full',
    reason: 'RIGHT là toàn bộ Predicate “uses the subject catalogue”, không phải chỉ động từ “uses” hoặc Object “the subject catalogue”.',
    worked: 'The library user | uses the subject catalogue.'
  }),
  trueFalse(9, {
    skill: 'cut',
    sourceItem: 8,
    sentence: "The library user does not know the author's name.",
    claim: "“The library user does not | know the author's name.” là cách chặt đúng.",
    answer: false,
    reason: 'Predicate bắt đầu từ trợ động từ đầu tiên “does”. Vì vậy phải CUT trước “does”, không phải trước “know”.',
    worked: "The library user | does not know the author's name."
  }),
  typing(10, {
    sourceItem: 15,
    sentence: 'The librarian stamps the book.',
    subject: 'The librarian',
    reason: 'Câu đang nói về “the librarian”, nên đây là toàn bộ LEFT / SUBJECT.',
    worked: 'The librarian | stamps the book.'
  }),
  mcq(11, {
    skill: 'cut',
    sourceItem: 17,
    sentence: 'The book is not on the shelf.',
    question: 'Đặt dấu | đúng ở đâu?',
    choiceEntries: [
      ['cut-before-be', 'The book | is not on the shelf.'],
      ['cut-after-be', 'The book is | not on the shelf.'],
      ['cut-before-place', 'The book is not | on the shelf.']
    ],
    correctChoiceId: 'cut-before-be',
    reason: '“is” là động từ TO BE và là điểm bắt đầu của Predicate, nên dấu | đứng trước “is”.',
    worked: 'The book | is not on the shelf.'
  }),
  trueFalse(12, {
    skill: 'right',
    sourceItem: 13,
    sentence: 'The library user checks the correct catalogue card.',
    claim: 'RIGHT / PREDICATE là “checks the correct catalogue card”.',
    answer: true,
    reason: 'Sau Subject “The library user”, toàn bộ phần “checks the correct catalogue card” nói điều Subject làm.',
    worked: 'The library user | checks the correct catalogue card.'
  }),
  typing(13, {
    sourceItem: 17,
    sentence: 'The book is not on the shelf.',
    subject: 'The book',
    reason: 'Câu đang nói về “the book”. Phần “is not on the shelf” là điều câu nói về cuốn sách.',
    worked: 'The book | is not on the shelf.'
  }),
  mcq(14, {
    skill: 'cut',
    sourceItem: 16,
    sentence: 'The library user takes the book out of the library.',
    question: 'Đặt dấu | đúng ở đâu?',
    choiceEntries: [
      ['cut-inside-subject', 'The library | user takes the book out of the library.'],
      ['cut-before-verb', 'The library user | takes the book out of the library.'],
      ['cut-before-object', 'The library user takes | the book out of the library.']
    ],
    correctChoiceId: 'cut-before-verb',
    reason: 'Subject là “The library user”; Predicate bắt đầu từ động từ “takes”, nên CUT đứng trước “takes”.',
    worked: 'The library user | takes the book out of the library.'
  }),
  trueFalse(15, {
    skill: 'left',
    sourceItem: 7,
    sentence: 'The library user looks at the correct shelf.',
    claim: 'LEFT / SUBJECT là “The library user”.',
    answer: true,
    reason: 'Câu đang nói về người dùng thư viện, nên toàn bộ “The library user” là LEFT / SUBJECT.',
    worked: 'The library user | looks at the correct shelf.'
  }),
  typing(16, {
    sourceItem: 1,
    sentence: 'A library user wants to find a book in a library.',
    subject: 'A library user',
    reason: 'Câu đang nói về “a library user”. Hãy lấy toàn bộ cụm danh từ, không chỉ “a library”.',
    worked: 'A library user | wants to find a book in a library.'
  }),
  mcq(17, {
    skill: 'right',
    sourceItem: 18,
    sentence: 'The library user asks the librarian for the book.',
    question: 'RIGHT / PREDICATE là phần nào?',
    choiceEntries: [
      ['right-full', 'asks the librarian for the book'],
      ['object-part', 'the librarian for the book'],
      ['tail-only', 'for the book']
    ],
    correctChoiceId: 'right-full',
    reason: 'RIGHT bắt đầu từ động từ “asks” và giữ toàn bộ phần còn lại của Predicate.',
    worked: 'The library user | asks the librarian for the book.'
  }),
  trueFalse(18, {
    skill: 'right',
    sourceItem: 14,
    sentence: 'The library user looks for the book on the shelf.',
    claim: 'RIGHT / PREDICATE là “the book on the shelf”.',
    answer: false,
    reason: '“the book on the shelf” chỉ là phần sau của Predicate. RIGHT đầy đủ phải bắt đầu từ động từ “looks”.',
    worked: 'The library user | looks for the book on the shelf.'
  }),
  typing(19, {
    sourceItem: 12,
    sentence: 'The library user checks the book titles in the subject catalogue.',
    subject: 'The library user',
    reason: 'WHO / WHAT? → câu đang nói về “the library user”, nên đây là LEFT / SUBJECT.',
    worked: 'The library user | checks the book titles in the subject catalogue.'
  }),
  mcq(20, {
    skill: 'cut',
    sourceItem: 12,
    sentence: 'The library user checks the book titles in the subject catalogue.',
    question: 'Cách phân tích LEFT | RIGHT nào đúng?',
    choiceEntries: [
      ['cut-inside-subject', 'The library | user checks the book titles in the subject catalogue.'],
      ['complete-analysis', 'The library user | checks the book titles in the subject catalogue.'],
      ['cut-before-object', 'The library user checks | the book titles in the subject catalogue.']
    ],
    correctChoiceId: 'complete-analysis',
    reason: 'LEFT phải là toàn bộ “The library user”, và RIGHT bắt đầu từ động từ đầu tiên “checks”.',
    worked: 'The library user | checks the book titles in the subject catalogue.'
  })
];

export const mrtLeftCutRight01Content = deepFreeze({ items });
