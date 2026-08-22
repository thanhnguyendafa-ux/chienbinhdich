const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });

const typingUi = freeze({
  promptLabel: 'Bài trong SBT',
  contextLabel: 'Đề bài',
  instruction: 'Làm đúng yêu cầu của câu trong SBT.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ câu trả lời...'
});

const openTypingUi = freeze({
  promptLabel: 'Bài mở trong SBT',
  contextLabel: 'Đề bài',
  instruction: 'Tự viết câu trả lời của em. Bài này có thể có nhiều đáp án đúng.',
  inputLabel: 'Câu trả lời của em',
  placeholder: 'Gõ câu trả lời của em...'
});

const choice = (id, text) => freeze({ id, text, preserveOrder: true });
const teaching = ({ correctLabel, reason, theory, example }) => freeze({ correctLabel, reason, theory, example });

const preTheory = ({ title, intro, sourceSections, sections, summary }) => freeze({
  required: true,
  title,
  intro,
  sourceSections: freeze(sourceSections),
  sections: freeze(sections.map(section => freeze({
    heading: section.heading,
    bullets: freeze(section.bullets)
  }))),
  summary
});

const typing = ({ id, prompt, answer, acceptedAnswers = [], reason, theory, example, open = false, sourceWordBank = null }) => freeze({
  id,
  type: 'typing',
  vi: prompt,
  en: answer,
  ...(acceptedAnswers.length ? { acceptedAnswers: freeze(acceptedAnswers) } : {}),
  ...(open ? { responseMode: 'open' } : {}),
  ...(sourceWordBank ? { sourceWordBank: freeze(sourceWordBank), sourceWordBankLabel: 'Từ / cụm từ cho sẵn' } : {}),
  typingUi: open ? openTypingUi : typingUi,
  theorySupport,
  teachingFeedback: teaching({ correctLabel: open ? 'Bài tham khảo' : answer, reason, theory, example })
});

const mcq = ({ id, prompt, options, correct, reason, theory, example, stimulus = null }) => freeze({
  id,
  type: 'mcq',
  prompt,
  ...(stimulus ? { stimulus: freeze(stimulus) } : {}),
  choices: freeze(options.map(([choiceId, text]) => choice(choiceId, text))),
  correctChoiceId: correct,
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: options.find(([choiceId]) => choiceId === correct)?.[1] ?? correct,
    reason,
    theory,
    example
  })
});

const classification = ({ id, prompt, groups, tokens, reason, theory, example }) => freeze({
  id,
  type: 'classification',
  prompt,
  classificationKind: 'generic',
  groups: freeze(groups.map(group => freeze(group))),
  tokens: freeze(tokens.map(token => freeze({ ...token, preserveOrder: true }))),
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: '/s/: caps, clocks, lights · /z/: beds, posters, villas',
    reason,
    theory,
    example
  })
});

const sequence = ({ id, prompt, lines, correctOrder, reason, theory, example }) => freeze({
  id,
  type: 'sequence_number',
  prompt,
  lines: freeze(lines.map(line => freeze(line))),
  correctOrder: freeze(correctOrder),
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: correctOrder.join(' → '),
    reason,
    theory,
    example
  })
});

const WORD_BOX_D1 = freeze(['untidy', 'are', 'not', 'near', 'next', 'on', 'his', 'school bag']);

const D1_TEXT = `An's bedroom is big but messy. There (1) ______ clothes on the floor. There is a big desk (2) ______ the window, and there are dirty bowls and chopsticks (3) ______ it. He usually puts his (4) ______ under the desk. His bed is (5) ______ to the desk, and it is also (6) ______. There is a cap, some CDs and some books on the bed. An's mum is (7) ______ happy with this, and now An is tidying up (8) ______ room.`;

const D2_TEXT = `Mum: We're moving to the new flat next month. Do you want to have a new bed?\nMi: No, I don't, Mum. I (1) ______ my old bed. It's so comfortable. But can I (2) ______ a new poster?\nMum: You have three posters already. You can put them (3) ______ the wall in your new room.\nMi: Yes, Mum. I want to have a family photo on my desk. There (4) ______ only a lamp on it now.\nMum: That's a good idea. Oh, where do you want to put your desk?\nMi: (5) ______ to my bed, Mum. I also want a small plant in my room.\nMum: That's fine. It can go (6) ______ the bookshelf and the desk.`;

const D3_EMAILS = `Vy: My bedroom is small. I have a bed, a wardrobe, a desk, a chair and a lamp. I have three posters of my favourite singers on the wall. I usually do my homework on the desk in front of the big window. My bedroom is my favourite room in the house. It's comfortable.\n\nTom: My favourite room in the house is also my bedroom. It's big with a bed, a wardrobe, a chair, a desk and a lamp. I don't have any posters, but there is a picture of my family on the wall. My desk is next to my bed. Oh, my room also has a bookshelf and a big window. I love my room. It's cozy.`;

const C2_OPTIONS = [
  ['A', "Yes. I love it, Nick. It's very comfortable."],
  ['B', "No, there isn't. I only watch TV in the living room."],
  ['C', "Yes, I am. It's a small room."],
  ['D', 'Yes, of course. My bed is next to a wardrobe. Do you have a wardrobe in your room?'],
  ['E', 'Yes, very much. Do you like posters?']
];

const theories = freeze({
  a1: preTheory({
    title: 'Nhắc nhanh · Âm cuối -s',
    intro: 'Con chỉ cần nhớ một mẹo nhỏ rồi phân loại các từ trong bài.',
    sourceSections: ['SBT trang 10 · A. Pronunciation · Bài 1'],
    sections: [
      { heading: '1. Có hai âm cần chọn', bullets: ['/s/ là âm nhẹ, cổ không rung nhiều.', '/z/ là âm có rung. Con có thể đặt tay lên cổ để cảm nhận.'] },
      { heading: '2. Nhìn âm ngay trước -s', bullets: ['Sau các âm như /p/, /t/, /k/, final -s thường đọc /s/.', 'Sau nguyên âm và nhiều âm có rung, final -s thường đọc /z/.'] },
      { heading: 'Ví dụ khác bài', bullets: ['books → /s/', 'pens → /z/', 'Đừng nhìn mỗi chữ s; hãy nghĩ đến âm đứng ngay trước s.'] }
    ],
    summary: 'Nhớ: âm trước -s không rung → thường /s/; có rung → thường /z/.'
  }),
  a2: preTheory({
    title: 'Nhắc nhanh · Tự tìm từ có final -s',
    intro: 'Bài này không có một bộ đáp án duy nhất. Con chỉ cần viết từ đúng nhóm âm.',
    sourceSections: ['SBT trang 10 · A. Pronunciation · Bài 2'],
    sections: [
      { heading: '1. Nhớ lại hai nhóm', bullets: ['Ví dụ: books → /s/.', 'Ví dụ: pens → /z/.'] },
      { heading: '2. Cách làm', bullets: ['Cột /s/: viết 3 từ có s cuối đọc /s/.', 'Cột /z/: viết 3 từ có s cuối đọc /z/.', 'Từ khác bài mẫu vẫn đúng nếu con phát âm đúng.'] }
    ],
    summary: 'Viết đúng nhóm âm là được; không cần giống hệt bài tham khảo.'
  }),
  b3: preTheory({
    title: 'Nhắc nhanh · Tìm từ khác nhóm',
    intro: 'Đừng đoán ngay từ lạ. Hãy tìm ba từ có điểm chung trước.',
    sourceSections: ['SBT trang 11 · B. Vocabulary & Grammar · Bài 3'],
    sections: [
      { heading: 'Cách nghĩ 2 bước', bullets: ['Bước 1: tìm 3 từ cùng nhóm nghĩa.', 'Bước 2: từ còn lại là từ khác nhóm.'] },
      { heading: 'Ví dụ khác bài', bullets: ['apple · banana · orange · bedroom', 'Ba từ đầu là trái cây; bedroom là căn phòng → bedroom khác nhóm.'] }
    ],
    summary: 'Tìm nhóm 3 từ trước, rồi mới chọn từ còn lại.'
  }),
  b4: preTheory({
    title: "Nhắc nhanh · 's nghĩa là ‘của’",
    intro: "Bài này hỏi dạng sở hữu. Con chỉ cần nghĩ: đồ/người này là của ai?",
    sourceSections: ['SBT trang 11 · B. Vocabulary & Grammar · Bài 4'],
    sections: [
      { heading: "Công thức rất ngắn", bullets: ["Tên/người + 's + đồ/người", "Peter's pencil = bút chì của Peter", "Lan's book = sách của Lan"] },
      { heading: 'Lỗi dễ mắc', bullets: ["Không viết: Peter pencil.", "Khi nghĩa là ‘của Peter’, cần Peter's."] }
    ],
    summary: "Thấy nghĩa ‘của ai’ → nghĩ tới 's sau người sở hữu."
  }),
  c1: preTheory({
    title: 'Nhắc nhanh · Xếp hội thoại theo ý',
    intro: 'Hội thoại phải nghe giống hai người đang thật sự nói với nhau.',
    sourceSections: ['SBT trang 12 · C. Speaking · Bài 1'],
    sections: [
      { heading: 'Cách xếp', bullets: ['Tìm câu hỏi trước.', 'Tìm câu trả lời trực tiếp.', 'Sau đó mới nối ý tiếp theo.'] },
      { heading: 'Ví dụ khác bài', bullets: ["A: What are you doing?", "B: I'm reading.", "C: That's interesting.", 'Thứ tự hợp lý: hỏi → trả lời → phản hồi.'] },
      { heading: 'Chú ý', bullets: ['Các từ it, that, another thường cần một ý đã xuất hiện trước.'] }
    ],
    summary: 'Hỏi → trả lời → nối ý. Đừng xếp chỉ vì hai câu có từ giống nhau.'
  }),
  c2: preTheory({
    title: 'Nhắc nhanh · Chọn câu hợp hội thoại',
    intro: 'Mỗi chỗ trống phải khớp cả câu trước và câu sau.',
    sourceSections: ['SBT trang 12 · C. Speaking · Bài 2'],
    sections: [
      { heading: 'Nhìn dạng câu hỏi', bullets: ['Are you ...? → thường trả lời Yes, I am. / No, I am not.', 'Do you ...? → thường trả lời Yes, I do. / No, I do not.', "Is there ...? → thường trả lời Yes, there is. / No, there isn't."] },
      { heading: 'Nhìn ý nối tiếp', bullets: ['next to = bên cạnh.', 'Nếu câu sau nói Me, too, hãy xem câu trước đang nói sở thích hay thói quen gì.'] }
    ],
    summary: 'Đọc một câu trước và một câu sau chỗ trống rồi mới chọn.'
  }),
  c3: preTheory({
    title: 'Nhắc nhanh · Tạo câu hỏi và nói về nhà',
    intro: 'Bài này cho từ gợi ý. Con biến chúng thành câu hoàn chỉnh.',
    sourceSections: ['SBT trang 13 · C. Speaking · Bài 3'],
    sections: [
      { heading: 'Ba khung cần nhớ', bullets: ['Who do you live with? = Con sống với ai?', 'Do you live ...? dùng để hỏi về hành động live.', 'Is your ... big? dùng be để hỏi đặc điểm.'] },
      { heading: 'There is / There are', bullets: ['There is + một vật/ý đầu tiên.', 'There are + nhiều vật khi câu bắt đầu trực tiếp bằng danh từ số nhiều.', 'Ví dụ khác bài: There is a board. There are twenty desks.'] }
    ],
    summary: 'Hỏi hành động → do; hỏi đặc điểm với be → is/are; kể đồ vật → there is/there are.'
  }),
  d1: preTheory({
    title: 'Nhắc nhanh · Điền từ vào đoạn văn',
    intro: 'Mỗi chỗ trống phải đúng cả nghĩa, ngữ pháp và từ đứng bên cạnh.',
    sourceSections: ['SBT trang 13 · D. Reading · Bài 1'],
    sections: [
      { heading: 'Ba câu hỏi trước khi điền', bullets: ['Nghĩa có hợp không?', 'Câu có đúng ngữ pháp không?', 'Từ bên trái/bên phải có tạo thành cụm quen thuộc không?'] },
      { heading: 'Mấy điều cần nhớ', bullets: ['There are + nhiều vật.', 'on = trên; near = gần; next to = bên cạnh.', 'he → his = của cậu ấy.', 'not = không.'] },
      { heading: 'Ví dụ khác bài', bullets: ['There are two pencils on the desk.', 'His bag is next to the chair.'] }
    ],
    summary: 'Đọc cả câu, không chọn từ chỉ vì thấy nghĩa quen.'
  }),
  d2: preTheory({
    title: 'Nhắc nhanh · Chọn từ trong hội thoại',
    intro: 'Đọc cả câu rồi kiểm tra cả nghĩa và cụm từ.',
    sourceSections: ['SBT trang 13 · D. Reading · Bài 2'],
    sections: [
      { heading: 'Cấu trúc nhỏ cần nhớ', bullets: ['can + động từ nguyên mẫu.', 'There is + một vật.', 'on = trên bề mặt.', 'next to = bên cạnh.', 'between A and B = ở giữa A và B.'] },
      { heading: 'Ví dụ khác bài', bullets: ['Can I open the window?', 'There is a lamp on the desk.', 'The chair is between the table and the bed.'] }
    ],
    summary: 'Đừng chọn chỉ theo một từ; đọc cả cụm trước và sau blank.'
  }),
  d3b: preTheory({
    title: 'Nhắc nhanh · Đọc email tìm đúng chi tiết',
    intro: 'Không cần nhớ cả hai email. Câu hỏi sẽ chỉ cho con nơi cần tìm.',
    sourceSections: ['SBT trang 14 · D. Reading · Bài 3b'],
    sections: [
      { heading: 'Cách đọc 4 bước', bullets: ['Đọc câu hỏi trước.', 'Xem câu hỏi nói Vy hay Tom.', 'Xem đang hỏi size, đồ vật hay lý do.', 'Tìm đúng câu trong email rồi trả lời ngắn gọn.'] },
      { heading: 'Mẹo', bullets: ['Hỏi Why? → tìm lý do.', 'Hỏi What is there? → tìm tên đồ vật.', 'Không cần chép cả email.'] }
    ],
    summary: 'Tên người → đúng email; loại câu hỏi → đúng thông tin.'
  }),
  e1: preTheory({
    title: 'Nhắc nhanh · Đổi cách nói nhưng giữ nguyên nghĩa',
    intro: 'Câu mới có thể khác từ, nhưng ý phải giống câu ban đầu.',
    sourceSections: ['SBT trang 15 · E. Writing · Bài 1'],
    sections: [
      { heading: 'Bốn kiểu cần nhớ', bullets: ['have ↔ there is / there are.', "Tên/người + 's = của ai.", 'in front of ↔ behind khi đổi góc nhìn.', 'favourite ↔ like ... best.'] },
      { heading: 'Ví dụ khác bài', bullets: ['I have a desk. ↔ There is a desk in my room.', "Peter has a pencil. ↔ Peter's pencil ...", 'The chair is in front of the desk. ↔ The desk is behind the chair.', 'My favourite subject is English. ↔ I like English best.'] }
    ],
    summary: 'Đổi cấu trúc, không đổi nghĩa.'
  }),
  e2: preTheory({
    title: 'Nhắc nhanh · Trả lời về căn phòng con thích',
    intro: 'Bài này là câu trả lời cá nhân. Không có một đáp án duy nhất.',
    sourceSections: ['SBT trang 15 · E. Writing · Bài 2'],
    sections: [
      { heading: 'Ba khung câu', bullets: ['My favourite room is ...', 'There is ... / There are ...', 'I like it because ...'] },
      { heading: 'Ví dụ khác bài', bullets: ['There is a board in my classroom.', 'There are many desks.', 'I like it because it is bright.'] }
    ],
    summary: 'Nói phòng nào → có những gì → vì sao con thích.'
  })
});

const contents = freeze({
  a1: freeze({
    preLessonTheory: theories.a1,
    items: freeze([
      classification({
        id: 'g6-u2-wb-a1-01',
        prompt: '1. Match the words which have the final s with the appropriate sound /s/ or /z/: beds, caps, posters, clocks, villas, lights.',
        groups: [
          { id: 's', label: '/s/', helper: 'final -s đọc /s/' },
          { id: 'z', label: '/z/', helper: 'final -s đọc /z/' }
        ],
        tokens: [
          { id: 'beds', text: 'beds', correctGroupId: 'z' },
          { id: 'caps', text: 'caps', correctGroupId: 's' },
          { id: 'posters', text: 'posters', correctGroupId: 'z' },
          { id: 'clocks', text: 'clocks', correctGroupId: 's' },
          { id: 'villas', text: 'villas', correctGroupId: 'z' },
          { id: 'lights', text: 'lights', correctGroupId: 's' }
        ],
        reason: 'beds, posters và villas có final -s đọc /z/. caps, clocks và lights có final -s đọc /s/.',
        theory: 'Con nhìn âm ngay trước -s: âm không rung như /p/, /k/, /t/ thường dẫn tới /s/; nhiều âm có rung dẫn tới /z/.',
        example: 'books → /s/; pens → /z/.'
      })
    ])
  }),

  a2: freeze({
    preLessonTheory: theories.a2,
    items: freeze([
      typing({ id: 'g6-u2-wb-a2-01', prompt: '2. Cột /s/: Write three words with the final s pronounced /s/.', answer: 'cups, books, cats', open: true, reason: 'Đây là bài mở. Ba từ mẫu cups, books, cats đều có final -s đọc /s/. Từ khác cũng được nếu phát âm đúng.', theory: 'Bài yêu cầu đúng nhóm âm, không yêu cầu giống hệt bộ từ tham khảo.', example: 'Bài tham khảo: cups · books · cats.' }),
      typing({ id: 'g6-u2-wb-a2-02', prompt: '2. Cột /z/: Write three words with the final s pronounced /z/.', answer: 'rulers, tables, chairs', open: true, reason: 'Đây là bài mở. Ba từ mẫu rulers, tables, chairs đều có final -s đọc /z/. Từ khác cũng được nếu phát âm đúng.', theory: 'Bài yêu cầu đúng nhóm âm, không yêu cầu giống hệt bộ từ tham khảo.', example: 'Bài tham khảo: rulers · tables · chairs.' })
    ])
  }),

  b3: freeze({
    preLessonTheory: theories.b3,
    items: freeze([
      mcq({ id: 'g6-u2-wb-b3-01', prompt: '1. Find which word does not belong: A. sofa  B. chair  C. toilet  D. table.', options: [['A','sofa'],['B','chair'],['C','toilet'],['D','table']], correct: 'C', reason: 'sofa, chair và table cùng nhóm đồ nội thất; toilet khác nhóm.', theory: 'Tìm ba từ cùng nhóm trước rồi chọn từ còn lại.', example: 'apple · banana · orange · bedroom → bedroom khác nhóm.' }),
      mcq({ id: 'g6-u2-wb-b3-02', prompt: '2. Find which word does not belong: A. flat  B. school  C. town house  D. villa.', options: [['A','flat'],['B','school'],['C','town house'],['D','villa']], correct: 'B', reason: 'flat, town house và villa là các kiểu nhà; school là trường học.', theory: 'Ba từ cùng nói về loại nhà, một từ nói về nơi học.', example: 'house · flat · villa = nhóm nhà ở.' }),
      mcq({ id: 'g6-u2-wb-b3-03', prompt: '3. Find which word does not belong: A. bed  B. lamp  C. fan  D. villa.', options: [['A','bed'],['B','lamp'],['C','fan'],['D','villa']], correct: 'D', reason: 'bed, lamp và fan là đồ dùng; villa là một kiểu nhà.', theory: 'Tìm nhóm nghĩa chung của ba từ.', example: 'desk · lamp · fan đều có thể là đồ dùng trong phòng.' }),
      mcq({ id: 'g6-u2-wb-b3-04', prompt: '4. Find which word does not belong: A. aunt  B. uncle  C. grandmother  D. teacher.', options: [['A','aunt'],['B','uncle'],['C','grandmother'],['D','teacher']], correct: 'D', reason: 'aunt, uncle và grandmother là người thân trong gia đình/họ hàng; teacher là giáo viên.', theory: 'Ba từ cùng chỉ quan hệ gia đình, teacher không thuộc nhóm này.', example: 'mother · father · brother = family.' }),
      mcq({ id: 'g6-u2-wb-b3-05', prompt: '5. Find which word does not belong: A. cousin  B. mother  C. father  D. brother.', options: [['A','cousin'],['B','mother'],['C','father'],['D','brother']], correct: 'A', reason: 'mother, father và brother là các thành viên gia đình gần; cousin là anh/chị/em họ.', theory: 'Nhìn mối quan hệ của các từ với nhau, không chỉ nhìn nghĩa riêng lẻ.', example: 'mother · father · sister = immediate family.' })
    ])
  }),

  b4: freeze({
    preLessonTheory: theories.b4,
    items: freeze([
      typing({ id: 'g6-u2-wb-b4-01', prompt: "1. ______ mother is my teacher of English. (Mai)", answer: "Mai's", reason: "Câu nói ‘mẹ của Mai’. ‘Của Mai’ → Mai's.", theory: "Tên/người + 's dùng để nói sở hữu.", example: "Mai's mother is my teacher of English." }),
      typing({ id: 'g6-u2-wb-b4-02', prompt: '2. Is it ______ study room? (Nam)', answer: "Nam's", reason: "Câu hỏi về ‘phòng học của Nam’ → Nam's study room.", theory: "Nam là người sở hữu nên thêm 's sau Nam.", example: "Is it Nam's study room?" }),
      typing({ id: 'g6-u2-wb-b4-03', prompt: '3. My ______ bedroom is my favourite room in our house. (grandmother)', answer: "grandmother's", reason: "Đây là ‘phòng ngủ của bà tôi’ → grandmother's bedroom.", theory: "Người sở hữu là grandmother → grandmother's.", example: "My grandmother's bedroom is my favourite room in our house." }),
      typing({ id: 'g6-u2-wb-b4-04', prompt: '4. My ______ father is my uncle. (cousin)', answer: "cousin's", reason: "Đây là ‘bố của anh/chị/em họ tôi’ → cousin's father.", theory: "cousin là người sở hữu → cousin's.", example: "My cousin's father is my uncle." }),
      typing({ id: 'g6-u2-wb-b4-05', prompt: '5. Look! ______ dog is running in the park. (Tom)', answer: "Tom's", reason: "Đây là ‘con chó của Tom’ → Tom's dog.", theory: "Tên Tom + 's để chỉ sở hữu.", example: "Look! Tom's dog is running in the park." }),
      typing({ id: 'g6-u2-wb-b4-06', prompt: '6. There is a cat behind my ______ computer. (sister)', answer: "sister's", reason: "Đây là ‘máy tính của chị/em gái tôi’ → my sister's computer.", theory: "sister là người sở hữu → sister's.", example: "There is a cat behind my sister's computer." })
    ])
  }),

  c1: freeze({
    preLessonTheory: theories.c1,
    items: freeze([
      sequence({
        id: 'g6-u2-wb-c1-01',
        prompt: '1. Rearrange the following sentences to make a complete dialogue between Mi and her older brother, Nam.',
        lines: [
          { id: 'A', text: "A. Nam: I'm drawing a picture to put in the living room." },
          { id: 'B', text: "B. Nam: Can you draw it? Then I'll hang it on the wall." },
          { id: 'C', text: 'C. Mi: What are you doing, Nam?' },
          { id: 'D', text: "D. Mi: OK. It'll make the dining room beautiful." },
          { id: 'E', text: "E. Mi: That's a good idea! How about drawing another picture for the dining room?" }
        ],
        correctOrder: ['C','A','E','B','D'],
        reason: 'C hỏi Nam đang làm gì → A trả lời. E nối ý bằng another picture → B nhờ Mi vẽ bức tranh đó → D đồng ý bằng OK.',
        theory: 'Xếp theo mạch hỏi → trả lời → đề nghị → phản hồi.',
        example: 'What are you doing? → I am reading. → That is interesting.'
      })
    ])
  }),

  c2: freeze({
    preLessonTheory: theories.c2,
    items: freeze([
      mcq({ id: 'g6-u2-wb-c2-01', prompt: '1. Nick: Mi, are you in your room? Mi: ______', options: C2_OPTIONS, correct: 'C', reason: "Nick hỏi Are you ...? nên câu trả lời Yes, I am khớp trực tiếp.", theory: 'Are you ...? → Yes, I am / No, I am not.', example: "Yes, I am. It's a small room." }),
      mcq({ id: 'g6-u2-wb-c2-02', prompt: '2. Nick: I can see some posters on the wall. Do you like posters? Mi: ______', options: C2_OPTIONS, correct: 'E', reason: 'Câu hỏi hỏi Mi có thích posters không. E trả lời Yes, very much rồi hỏi lại Nick.', theory: 'Do you like ...? cần câu trả lời nói thích hay không.', example: 'Yes, very much. Do you like posters?' }),
      mcq({ id: 'g6-u2-wb-c2-03', prompt: '3. Nick: Is there a TV in your room? Mi: ______', options: C2_OPTIONS, correct: 'B', reason: "Is there a TV ...? được trả lời bằng No, there isn't. Câu sau còn nói Mi chỉ xem TV ở phòng khách.", theory: "Is there ...? → Yes, there is / No, there isn't.", example: "No, there isn't. I only watch TV in the living room." }),
      mcq({ id: 'g6-u2-wb-c2-04', prompt: "4. Nick: I can't see the bed. Is there a bed in your room? Mi: ______", options: C2_OPTIONS, correct: 'D', reason: 'D trả lời Yes, of course và nói ngay My bed is next to a wardrobe, nên khớp câu hỏi về bed.', theory: 'Câu trả lời phải trả đúng vật vừa được hỏi và nối được câu sau.', example: 'My bed is next to a wardrobe.' }),
      mcq({ id: 'g6-u2-wb-c2-05', prompt: '5. Nick: Do you like your room? Mi: ______', options: C2_OPTIONS, correct: 'A', reason: "A trả lời trực tiếp: Yes. I love it ... It's very comfortable.", theory: 'Do you like ...? → câu trả lời phải nói có thích hay không.', example: "Yes. I love it, Nick. It's very comfortable." })
    ])
  }),

  c3: freeze({
    preLessonTheory: theories.c3,
    items: freeze([
      typing({ id: 'g6-u2-wb-c3-01', prompt: '1. Mira, who / live / with?', answer: 'Mira, who do you live with?', acceptedAnswers: ['Who do you live with, Mira?'], reason: 'Đây là câu hỏi với động từ live và chủ ngữ you, nên dùng do: Who do you live with?', theory: 'Hỏi hành động ở hiện tại đơn với you → do + you + V.', example: 'Mira, who do you live with?' }),
      typing({ id: 'g6-u2-wb-c3-02', prompt: '2. live / with / parents. And you?', answer: 'I live with my parents. And you?', reason: 'Cần thêm chủ ngữ I và tính từ sở hữu my để câu đầy đủ.', theory: 'I live with + người mình sống cùng.', example: 'I live with my parents. And you?' }),
      typing({ id: 'g6-u2-wb-c3-03', prompt: '3. live / with / parents / younger brother. / you / live / house?', answer: 'I live with my parents and my younger brother. Do you live in a house?', reason: 'Phần đầu kể người sống cùng; phần sau là câu hỏi hành động live nên dùng Do you live ...?', theory: 'Do + you + live ...?; live in a house.', example: 'Do you live in a house?' }),
      typing({ id: 'g6-u2-wb-c3-04', prompt: '4. No. / live / flat. / you / live / house?', answer: "No, I don't. I live in a flat. Do you live in a house?", acceptedAnswers: ['No. I live in a flat. Do you live in a house?'], reason: "No, I don't trả lời câu Do you live ...? Sau đó Mira nói I live in a flat và hỏi lại.", theory: "Do you ...? → No, I don't; live in a flat.", example: "No, I don't. I live in a flat." }),
      typing({ id: 'g6-u2-wb-c3-05', prompt: '5. Yes / do. / your flat / big?', answer: 'Yes, I do. Is your flat big?', reason: 'Yes, I do trả lời câu hỏi Do you live ...? Câu hỏi về đặc điểm big dùng be: Is your flat big?', theory: 'Hỏi đặc điểm với be → Is + subject + adjective?', example: 'Is your flat big?' }),
      typing({ id: 'g6-u2-wb-c3-06', prompt: '6. No, it / not. There / living room / two bedrooms / bathroom / kitchen.', answer: "No, it isn't. There is a living room, two bedrooms, a bathroom and a kitchen.", acceptedAnswers: ["No, it isn't. There are a living room, two bedrooms, a bathroom and a kitchen."], reason: "No, it isn't trả lời Is your flat big? Sau đó câu kể các phòng có trong căn hộ.", theory: 'There is/There are dùng để nói có gì ở một nơi.', example: "No, it isn't. There is a living room, two bedrooms, a bathroom and a kitchen." }),
      typing({ id: 'g6-u2-wb-c3-07', prompt: 'Now make a similar conversation with your friend.', answer: 'A: Who do you live with? B: I live with my parents. Do you live in a house? A: Yes, I do.', open: true, reason: 'Đây là phần nói mở. Đoạn hội thoại của con có thể khác bài tham khảo nếu dùng câu hỏi và câu trả lời hợp lý về nhà/người sống cùng.', theory: 'Dùng lại các khung Who do you live with? / Do you live ...? / Is your ...? / There is/are ...', example: 'Bài tham khảo chỉ là một cách làm.' })
    ])
  }),

  d1: freeze({
    preLessonTheory: theories.d1,
    items: freeze([
      typing({ id:'g6-u2-wb-d1-01', prompt:`${D1_TEXT}\n\nĐiền từ cho chỗ trống (1).`, answer:'are', sourceWordBank:WORD_BOX_D1, reason:'clothes là nhiều, nên dùng There are.', theory:'Nhiều → are.', example:'There are clothes on the floor.' }),
      typing({ id:'g6-u2-wb-d1-02', prompt:`${D1_TEXT}\n\nĐiền từ cho chỗ trống (2).`, answer:'near', sourceWordBank:WORD_BOX_D1, reason:'Câu nói cái bàn ở gần cửa sổ → near the window.', theory:'near = gần.', example:'There is a big desk near the window.' }),
      typing({ id:'g6-u2-wb-d1-03', prompt:`${D1_TEXT}\n\nĐiền từ cho chỗ trống (3).`, answer:'on', sourceWordBank:WORD_BOX_D1, reason:'dirty bowls and chopsticks ở trên cái bàn → on it.', theory:'on = ở trên bề mặt.', example:'There are dirty bowls and chopsticks on it.' }),
      typing({ id:'g6-u2-wb-d1-04', prompt:`${D1_TEXT}\n\nĐiền từ/cụm từ cho chỗ trống (4).`, answer:'school bag', acceptedAnswers:['schoolbag'], sourceWordBank:WORD_BOX_D1, reason:'An thường đặt cặp sách dưới bàn → school bag.', theory:'school bag = cặp sách.', example:'He usually puts his school bag under the desk.' }),
      typing({ id:'g6-u2-wb-d1-05', prompt:`${D1_TEXT}\n\nĐiền từ cho chỗ trống (5).`, answer:'next', sourceWordBank:WORD_BOX_D1, reason:'Sau blank đã có to. Cụm đúng là next to = bên cạnh.', theory:'next to = bên cạnh; đề đã có to nên điền next.', example:'His bed is next to the desk.' }),
      typing({ id:'g6-u2-wb-d1-06', prompt:`${D1_TEXT}\n\nĐiền từ cho chỗ trống (6).`, answer:'untidy', sourceWordBank:WORD_BOX_D1, reason:'Đầu đoạn nói phòng messy và có nhiều đồ bừa bộn. untidy = không gọn gàng.', theory:'Dùng nghĩa của cả đoạn để chọn adjective phù hợp.', example:'His bed is also untidy.' }),
      typing({ id:'g6-u2-wb-d1-07', prompt:`${D1_TEXT}\n\nĐiền từ cho chỗ trống (7).`, answer:'not', sourceWordBank:WORD_BOX_D1, reason:'Phòng rất bừa bộn nên mẹ An không vui → is not happy.', theory:'not = không.', example:"An's mum is not happy with this." }),
      typing({ id:'g6-u2-wb-d1-08', prompt:`${D1_TEXT}\n\nĐiền từ cho chỗ trống (8).`, answer:'his', sourceWordBank:WORD_BOX_D1, reason:'Đây là phòng của An. An là he → his room.', theory:'he → his = của cậu ấy.', example:'An is tidying up his room.' })
    ])
  }),

  d2: freeze({
    preLessonTheory: theories.d2,
    items: freeze([
      mcq({ id:'g6-u2-wb-d2-01', prompt:'1. I ______ my old bed. It is so comfortable.', options:[['A','hate'],['B','love'],['C','dislike']], correct:'B', stimulus:{title:'Mum and Mi · New flat',text:D2_TEXT,promptLabel:'Đọc hội thoại và chọn từ đúng'}, reason:'Chiếc giường rất comfortable, nên Mi nói love.', theory:'Đọc nghĩa câu sau để kiểm tra lựa chọn.', example:'I love my old bed. It is so comfortable.' }),
      mcq({ id:'g6-u2-wb-d2-02', prompt:'2. But can I ______ a new poster?', options:[['A','sell'],['B','buy'],['C','give']], correct:'B', stimulus:{title:'Mum and Mi · New flat',text:D2_TEXT,promptLabel:'Đọc hội thoại và chọn từ đúng'}, reason:'Mi muốn có poster mới nên hỏi có thể buy = mua hay không.', theory:'Sau can dùng động từ nguyên mẫu.', example:'Can I buy a new poster?' }),
      mcq({ id:'g6-u2-wb-d2-03', prompt:'3. You can put them ______ the wall in your new room.', options:[['A','in'],['B','near'],['C','on']], correct:'C', stimulus:{title:'Mum and Mi · New flat',text:D2_TEXT,promptLabel:'Đọc hội thoại và chọn từ đúng'}, reason:'Poster được đặt/treo trên bề mặt tường → on the wall.', theory:'on = trên bề mặt.', example:'You can put them on the wall.' }),
      mcq({ id:'g6-u2-wb-d2-04', prompt:'4. There ______ only a lamp on it now.', options:[['A','is'],['B','are'],['C',"isn't"]], correct:'A', stimulus:{title:'Mum and Mi · New flat',text:D2_TEXT,promptLabel:'Đọc hội thoại và chọn từ đúng'}, reason:'a lamp = một cái đèn → There is.', theory:'Một vật → is.', example:'There is only a lamp on it now.' }),
      mcq({ id:'g6-u2-wb-d2-05', prompt:'5. ______ to my bed, Mum.', options:[['A','Near'],['B','Behind'],['C','Next']], correct:'C', stimulus:{title:'Mum and Mi · New flat',text:D2_TEXT,promptLabel:'Đọc hội thoại và chọn từ đúng'}, reason:'Sau blank đã có to. Cụm đúng là next to = bên cạnh.', theory:'next to là một cụm; không nói near to trong bài này.', example:'Next to my bed, Mum.' }),
      mcq({ id:'g6-u2-wb-d2-06', prompt:'6. It can go ______ the bookshelf and the desk.', options:[['A','next to'],['B','between'],['C','in front of']], correct:'B', stimulus:{title:'Mum and Mi · New flat',text:D2_TEXT,promptLabel:'Đọc hội thoại và chọn từ đúng'}, reason:'Có hai mốc: the bookshelf và the desk. Vật ở giữa hai mốc → between A and B.', theory:'between A and B = ở giữa A và B.', example:'It can go between the bookshelf and the desk.' })
    ])
  }),

  d3b: freeze({
    preLessonTheory: theories.d3b,
    items: freeze([
      typing({ id:'g6-u2-wb-d3b-01', prompt:`${D3_EMAILS}\n\n1. Is Tom's bedroom big or small?`, answer:"It's big.", acceptedAnswers:['It is big.','Big.'], reason:"Trong email Tom có câu It's big. Câu hỏi hỏi size nên trả lời big.", theory:'Tên Tom → tìm email Tom; big or small → tìm từ chỉ kích thước.', example:"It's big." }),
      typing({ id:'g6-u2-wb-d3b-02', prompt:`${D3_EMAILS}\n\n2. What is there in Vy's bedroom?`, answer:'There is a bed, a wardrobe, a desk, a chair and a lamp. There are three posters.', acceptedAnswers:['A bed, a wardrobe, three posters, a chair, a desk and a lamp.','A bed, a wardrobe, three posters, a chair, a table and a lamp.'], reason:'Email Vy kể bed, wardrobe, desk, chair, lamp và three posters. Câu hỏi hỏi đồ vật nên liệt kê các đồ đó.', theory:'Vy → đọc email Vy; What is there? → tìm tên đồ vật.', example:'Có thể trả lời bằng câu đầy đủ hoặc danh sách đúng thông tin.' }),
      typing({ id:'g6-u2-wb-d3b-03', prompt:`${D3_EMAILS}\n\n3. What is there in Tom's bedroom?`, answer:'There is a bed, a wardrobe, a chair, a desk, a lamp, a family picture and a bookshelf.', acceptedAnswers:['A bed, a wardrobe, a picture, a chair, a desk, a lamp and a bookshelf.','A bed, a wardrobe, a chair, a desk, a lamp, a picture and a bookshelf.'], reason:'Email Tom kể bed, wardrobe, chair, desk, lamp, a family picture và bookshelf.', theory:'Tom → đọc email Tom; chỉ lấy các đồ vật được hỏi.', example:'Không cần chép cả email.' }),
      typing({ id:'g6-u2-wb-d3b-04', prompt:`${D3_EMAILS}\n\n4. Does Vy like her bedroom? Why / Why not?`, answer:"Yes, she does. Because it's comfortable.", acceptedAnswers:['Yes, she does because it is comfortable.','Yes. Because it is comfortable.'], reason:"Vy nói bedroom là favourite room và It's comfortable, nên câu trả lời là Yes; lý do là comfortable.", theory:'Does Vy like...? → tìm dấu hiệu thích; Why? → tìm lý do.', example:"Yes, she does. Because it's comfortable." }),
      typing({ id:'g6-u2-wb-d3b-05', prompt:`${D3_EMAILS}\n\n5. Does Tom like his bedroom? Why / Why not?`, answer:"Yes, he does. Because it's cozy.", acceptedAnswers:['Yes, he does because it is cozy.','Yes. Because it is cozy.'], reason:"Tom viết I love my room. It's cozy. → Tom thích phòng và lý do là cozy.", theory:'love = thích rất nhiều; Why? → lấy lý do cozy.', example:"Yes, he does. Because it's cozy." })
    ])
  }),

  e1: freeze({
    preLessonTheory: theories.e1,
    items: freeze([
      typing({ id:'g6-u2-wb-e1-01', prompt:"1. I don't have a bookshelf in my bedroom.\nThere ______________________________.", answer:"There isn't a bookshelf in my bedroom.", acceptedAnswers:['There is not a bookshelf in my bedroom.'], reason:"don't have a bookshelf = không có một bookshelf. Đổi sang There isn't ... nhưng giữ nguyên nghĩa.", theory:'Không có một vật → There is not / There is not contracted to There isn’t.', example:"There isn't a bookshelf in my bedroom." }),
      typing({ id:'g6-u2-wb-e1-02', prompt:'2. We have a sink, a fridge, a cooker and a cupboard in our kitchen.\nThere ______________________________.', answer:'There is a sink, a fridge, a cooker and a cupboard in our kitchen.', acceptedAnswers:['There are a sink, a fridge, a cooker and a cupboard in our kitchen.'], reason:'Câu mới đổi We have ... thành cấu trúc There ... nhưng vẫn giữ nguyên danh sách đồ trong bếp.', theory:'have và there is/are có thể diễn đạt cùng ý “có” theo hai cách khác nhau.', example:'There is a sink, a fridge, a cooker and a cupboard in our kitchen.' }),
      typing({ id:'g6-u2-wb-e1-03', prompt:"3. Mai has a notebook and it's on the table.\n_______________________________ is on the table.", answer:"Mai's notebook is on the table.", reason:"notebook là của Mai → Mai's notebook. Vị trí on the table giữ nguyên.", theory:"Mai + 's = của Mai.", example:"Mai's notebook is on the table." }),
      typing({ id:'g6-u2-wb-e1-04', prompt:'4. The dog is in front of the microwave.\nThe microwave _______________________________.', answer:'The microwave is behind the dog.', reason:'Dog ở trước microwave thì nhìn ngược lại: microwave ở sau dog.', theory:'in front of ↔ behind khi đổi góc nhìn.', example:'The microwave is behind the dog.' }),
      typing({ id:'g6-u2-wb-e1-05', prompt:'5. My favourite room in the house is the living room.\nI like _______________________________.', answer:'I like the living room best in the house.', acceptedAnswers:['I like the living room the best in the house.'], reason:'favourite = thích nhất. Đổi sang like ... best nhưng giữ nguyên living room và in the house.', theory:'My favourite X is Y ↔ I like Y best.', example:'I like the living room best in the house.' })
    ])
  }),

  e2: freeze({
    preLessonTheory: theories.e2,
    items: freeze([
      typing({ id:'g6-u2-wb-e2-01', prompt:'1. What is your favourite room in your house?', answer:'My favourite room is my bedroom.', open:true, reason:'Đây là câu hỏi cá nhân. Con có thể chọn bedroom, living room hoặc phòng khác trong nhà.', theory:'Dùng My favourite room is ... hoặc I like ... best.', example:'Bài tham khảo: My favourite room is my bedroom.' }),
      typing({ id:'g6-u2-wb-e2-02', prompt:'2. What are the things in the room?', answer:'There is a bed, a wardrobe, a chair, a desk and a lamp.', open:true, reason:'Hãy kể những đồ thật sự có trong căn phòng con vừa chọn. Câu trả lời có thể khác bài tham khảo.', theory:'There is ... cho một vật/khởi đầu danh sách; There are ... cho nhiều vật.', example:'Bài tham khảo: There is a bed, a wardrobe, a chair, a desk and a lamp.' }),
      typing({ id:'g6-u2-wb-e2-03', prompt:'3. Why do you like this room?', answer:"Because it's beautiful and comfortable.", open:true, reason:'Why? hỏi lý do. Con chỉ cần nêu một lý do hợp lý về căn phòng của mình.', theory:'I like it because ... / Because it is ...', example:"Bài tham khảo: Because it's beautiful and comfortable." })
    ])
  })
});

export function getG6U2WorkbookContent(key) {
  const content = contents[String(key ?? '').toLowerCase()];
  if (!content) throw new Error(`Unknown G6 U2 workbook lesson: ${key}`);
  return content;
}
