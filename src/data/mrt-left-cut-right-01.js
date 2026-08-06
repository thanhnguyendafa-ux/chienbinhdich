const SKILLS = Object.freeze({
  left: 'LEFT / SUBJECT',
  cut: 'CUT |',
  right: 'RIGHT / PREDICATE'
});

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

function mcq(number, skill, sourceItem, sentence, question, choiceEntries, correctChoiceId, reason, worked) {
  const correctText = choiceEntries.find(([id]) => id === correctChoiceId)?.[1] ?? '';
  return {
    id: itemId(number),
    type: 'mcq',
    skill,
    sourceItem,
    prompt: `Cho câu: “${sentence}” ${question}`,
    choices: choices(choiceEntries),
    correctChoiceId,
    teachingFeedback: teaching(skill, correctText, reason, worked)
  };
}

function trueFalse(number, skill, sourceItem, sentence, claim, answer, reason, worked) {
  return {
    id: itemId(number),
    type: 'true_false',
    skill,
    sourceItem,
    statement: `Cho câu: “${sentence}” Nhận định: ${claim}`,
    answer,
    teachingFeedback: teaching(skill, answer ? 'TRUE' : 'FALSE', reason, worked)
  };
}

function typing(number, sourceItem, sentence, subject, reason, worked) {
  return {
    id: itemId(number),
    type: 'typing',
    skill: 'left',
    sourceItem,
    vi: sentence,
    en: subject,
    typingUi: LEFT_TYPING_UI,
    teachingFeedback: teaching('left', subject, reason, worked)
  };
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

const items = [
  mcq(
    1,
    'left',
    2,
    "The library user knows the author's name.",
    'LEFT / SUBJECT là phần nào?',
    [
      ['left-full', 'The library user'],
      ['left-partial', 'The library'],
      ['predicate', "knows the author's name"]
    ],
    'left-full',
    'Câu đang nói về toàn bộ “the library user”. “The library” chỉ là một phần của cụm Subject.',
    "The library user | knows the author's name."
  ),
  trueFalse(
    2,
    'cut',
    5,
    'The library user checks the shelf mark.',
    '“The library user | checks the shelf mark.” là cách chặt đúng.',
    true,
    'Predicate bắt đầu từ động từ “checks”, vì vậy dấu | đứng ngay trước “checks”.',
    'The library user | checks the shelf mark.'
  ),
  mcq(
    3,
    'right',
    6,
    'The library user writes down the shelf mark.',
    'RIGHT / PREDICATE là phần nào?',
    [
      ['right-full', 'writes down the shelf mark'],
      ['right-verb-only', 'writes down'],
      ['object-only', 'the shelf mark']
    ],
    'right-full',
    'RIGHT phải gồm toàn bộ điều câu nói về Subject: hành động “writes down” và phần đi cùng “the shelf mark”.',
    'The library user | writes down the shelf mark.'
  ),
  typing(
    4,
    3,
    'The library user uses the author catalogue.',
    'The library user',
    'Câu đang nói về “the library user”, nên toàn bộ cụm này là LEFT / SUBJECT.',
    'The library user | uses the author catalogue.'
  ),
  mcq(
    5,
    'cut',
    1,
    'A library user wants to find a book in a library.',
    'Đặt dấu | đúng ở đâu?',
    [
      ['cut-inside-subject', 'A library | user wants to find a book in a library.'],
      ['cut-before-first-verb', 'A library user | wants to find a book in a library.'],
      ['cut-before-second-verb', 'A library user wants to | find a book in a library.']
    ],
    'cut-before-first-verb',
    'Predicate bắt đầu ở động từ đầu tiên “wants”. “find” là động từ nằm sau “wants to”, nên không phải điểm bắt đầu của RIGHT.',
    'A library user | wants to find a book in a library.'
  ),
  trueFalse(
    6,
    'left',
    4,
    'The library user finds the book title in the author catalogue.',
    'LEFT / SUBJECT của câu là “The library”.',
    false,
    'Subject đầy đủ là “The library user”. Nếu chỉ lấy “The library” thì đã cắt mất head noun “user”.',
    'The library user | finds the book title in the author catalogue.'
  ),
  typing(
    7,
    10,
    'The library has no title catalogue.',
    'The library',
    'Câu đang nói về “the library”, nên “The library” là LEFT / SUBJECT.',
    'The library | has no title catalogue.'
  ),
  mcq(
    8,
    'right',
    11,
    'The library user uses the subject catalogue.',
    'RIGHT / PREDICATE là phần nào?',
    [
      ['right-full', 'uses the subject catalogue'],
      ['verb-only', 'uses'],
      ['object-only', 'the subject catalogue']
    ],
    'right-full',
    'RIGHT là toàn bộ Predicate “uses the subject catalogue”, không phải chỉ động từ “uses” hoặc Object “the subject catalogue”.',
    'The library user | uses the subject catalogue.'
  ),
  trueFalse(
    9,
    'cut',
    8,
    "The library user does not know the author's name.",
    "“The library user does not | know the author's name.” là cách chặt đúng.",
    false,
    'Predicate bắt đầu từ trợ động từ đầu tiên “does”. Vì vậy phải CUT trước “does”, không phải trước “know”.',
    "The library user | does not know the author's name."
  ),
  typing(
    10,
    15,
    'The librarian stamps the book.',
    'The librarian',
    'Câu đang nói về “the librarian”, nên đây là toàn bộ LEFT / SUBJECT.',
    'The librarian | stamps the book.'
  ),
  mcq(
    11,
    'cut',
    17,
    'The book is not on the shelf.',
    'Đặt dấu | đúng ở đâu?',
    [
      ['cut-before-be', 'The book | is not on the shelf.'],
      ['cut-after-be', 'The book is | not on the shelf.'],
      ['cut-before-place', 'The book is not | on the shelf.']
    ],
    'cut-before-be',
    '“is” là động từ TO BE và là điểm bắt đầu của Predicate, nên dấu | đứng trước “is”.',
    'The book | is not on the shelf.'
  ),
  trueFalse(
    12,
    'right',
    13,
    'The library user checks the correct catalogue card.',
    'RIGHT / PREDICATE là “checks the correct catalogue card”.',
    true,
    'Sau Subject “The library user”, toàn bộ phần “checks the correct catalogue card” nói điều Subject làm.',
    'The library user | checks the correct catalogue card.'
  ),
  typing(
    13,
    17,
    'The book is not on the shelf.',
    'The book',
    'Câu đang nói về “the book”. Phần “is not on the shelf” là điều câu nói về cuốn sách.',
    'The book | is not on the shelf.'
  ),
  mcq(
    14,
    'cut',
    16,
    'The library user takes the book out of the library.',
    'Đặt dấu | đúng ở đâu?',
    [
      ['cut-inside-subject', 'The library | user takes the book out of the library.'],
      ['cut-before-verb', 'The library user | takes the book out of the library.'],
      ['cut-before-object', 'The library user takes | the book out of the library.']
    ],
    'cut-before-verb',
    'Subject là “The library user”; Predicate bắt đầu từ động từ “takes”, nên CUT đứng trước “takes”.',
    'The library user | takes the book out of the library.'
  ),
  trueFalse(
    15,
    'left',
    7,
    'The library user looks at the correct shelf.',
    'LEFT / SUBJECT là “The library user”.',
    true,
    'Câu đang nói về người dùng thư viện, nên toàn bộ “The library user” là LEFT / SUBJECT.',
    'The library user | looks at the correct shelf.'
  ),
  typing(
    16,
    1,
    'A library user wants to find a book in a library.',
    'A library user',
    'Câu đang nói về “a library user”. Hãy lấy toàn bộ cụm danh từ, không chỉ “a library”.',
    'A library user | wants to find a book in a library.'
  ),
  mcq(
    17,
    'right',
    18,
    'The library user asks the librarian for the book.',
    'RIGHT / PREDICATE là phần nào?',
    [
      ['right-full', 'asks the librarian for the book'],
      ['object-part', 'the librarian for the book'],
      ['tail-only', 'for the book']
    ],
    'right-full',
    'RIGHT bắt đầu từ động từ “asks” và giữ toàn bộ phần còn lại của Predicate.',
    'The library user | asks the librarian for the book.'
  ),
  trueFalse(
    18,
    'right',
    14,
    'The library user looks for the book on the shelf.',
    'RIGHT / PREDICATE là “the book on the shelf”.',
    false,
    '“the book on the shelf” chỉ là phần sau của Predicate. RIGHT đầy đủ phải bắt đầu từ động từ “looks”.',
    'The library user | looks for the book on the shelf.'
  ),
  typing(
    19,
    12,
    'The library user checks the book titles in the subject catalogue.',
    'The library user',
    'WHO / WHAT? → câu đang nói về “the library user”, nên đây là LEFT / SUBJECT.',
    'The library user | checks the book titles in the subject catalogue.'
  ),
  mcq(
    20,
    'cut',
    12,
    'The library user checks the book titles in the subject catalogue.',
    'Cách phân tích LEFT | RIGHT nào đúng?',
    [
      ['cut-inside-subject', 'The library | user checks the book titles in the subject catalogue.'],
      ['complete-analysis', 'The library user | checks the book titles in the subject catalogue.'],
      ['cut-before-object', 'The library user checks | the book titles in the subject catalogue.']
    ],
    'complete-analysis',
    'LEFT phải là toàn bộ “The library user”, và RIGHT bắt đầu từ động từ đầu tiên “checks”.',
    'The library user | checks the book titles in the subject catalogue.'
  )
];

export const mrtLeftCutRight01Content = deepFreeze({ items });
